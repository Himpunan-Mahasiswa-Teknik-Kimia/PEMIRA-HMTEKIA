"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Vote, User, CheckCircle, Loader2, AlertCircle, Eye, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Candidate {
  id: string
  name: string
  nim: string
  prodi: string
  position: string
  visi: string
  misi: string
  photo?: string
  isActive: boolean
}

interface MeUser {
  id: string
  name: string
  email: string
  nim: string
  role: string
  hasVoted: boolean
}

interface MeResponse {
  user: MeUser
}

export default function VotePage() {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [ketuaHimpunanCandidates, setKetuaHimpunanCandidates] = useState<Candidate[]>([])
  const [sekjenCandidates, setSekjenCandidates] = useState<Candidate[]>([])
  const [selectedKetuaHimpunan, setSelectedKetuaHimpunan] = useState<string>("")
  const [selectedSekjen, setSelectedSekjen] = useState<string>("")
  const [votedForKetuaHimpunan, setVotedForKetuaHimpunan] = useState(false)
  const [votedForSekjen, setVotedForSekjen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [currentStep, setCurrentStep] = useState<'ketua' | 'sekjen' | 'complete'>('ketua')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        console.log('Checking auth and loading data...')

        // Check authentication
        const authResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!authResponse.ok) {
          console.log('Not authenticated, redirecting to login')
          router.push("/login")
          return
        }

        const userData: MeResponse = await authResponse.json()
        console.log('User data:', userData)

        if (userData.user?.hasVoted) {
          console.log('User already voted, redirecting to /success')
          router.push("/success")
          return
        }

        setUser(userData)

        // Check if user has validated voting session
        const sessionResponse = await fetch('/api/qr-code', {
          method: 'GET',
          credentials: 'include',
        })

        if (!sessionResponse.ok) {
          console.log('No voting session, redirecting to generate-code')
          router.push("/generate-code")
          return
        }

        const sessionData = await sessionResponse.json()
        console.log('Session data:', sessionData)

        if (!sessionData.session?.isValidated) {
          console.log('Session not validated, redirecting to generate-code')
          router.push("/generate-code")
          return
        }

        if (sessionData.session?.isUsed) {
          console.log('Session already used, redirecting to /success')
          router.push("/success")
          return
        }

        // Load candidates
        console.log('Loading candidates...')
        const candidatesResponse = await fetch('/api/candidates', {
          method: 'GET',
          credentials: 'include',
        })

        if (!candidatesResponse.ok) {
          throw new Error('Failed to load candidates')
        }

        const candidatesData = await candidatesResponse.json()
        console.log('Candidates data:', candidatesData)

        const allCandidates = candidatesData.candidates || []
        setCandidates(allCandidates)

        // Separate candidates by position
        const ketuaCandidates = allCandidates.filter((c: Candidate) => c.position === 'KETUA_HIMPUNAN')
        const sekjenCandidatesFiltered = allCandidates.filter((c: Candidate) => c.position === 'SEKJEN')
        
        setKetuaHimpunanCandidates(ketuaCandidates)
        setSekjenCandidates(sekjenCandidatesFiltered)

        if (allCandidates.length === 0) {
          setError('Tidak ada kandidat yang tersedia saat ini')
        }

      } catch (err) {
        console.error('Error loading data:', err)
        setError("Terjadi kesalahan saat memuat data: " + (err instanceof Error ? err.message : 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndLoadData()
  }, [router])

  const handleVoteSubmit = async (position: 'KETUA_HIMPUNAN' | 'SEKJEN', candidateId: string) => {
    if (!user) return

    setVoting(true)
    setError("")
    setSuccess("")

    try {
      console.log('Submitting vote for position:', position, 'candidate:', candidateId)

      const response = await fetch('/api/vote', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: candidateId,
          position: position
        })
      })

      const data = await response.json()
      console.log('Vote response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote')
      }

      if (position === 'KETUA_HIMPUNAN') {
        setVotedForKetuaHimpunan(true)
        setSuccess('Vote untuk Ketua Himpunan berhasil! Silakan pilih Sekjen.')
        setCurrentStep('sekjen')
        setShowConfirmDialog(false)
      } else if (position === 'SEKJEN') {
        setVotedForSekjen(true)
        setSuccess('Vote untuk Sekjen berhasil! Terima kasih atas partisipasi Anda.')
        setCurrentStep('complete')
        setShowConfirmDialog(false)
        
        // Redirect to success page after both votes complete
        setTimeout(() => {
          router.push("/success")
        }, 1500)
      }

    } catch (err) {
      console.error('Vote error:', err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan vote")
      setShowConfirmDialog(false)
    } finally {
      setVoting(false)
    }
  }

  const handleShowDetail = (candidate: Candidate) => {
    setDetailCandidate(candidate)
    setShowDetailDialog(true)
  }

  const handleConfirmVote = (position: 'KETUA_HIMPUNAN' | 'SEKJEN') => {
    const selectedId = position === 'KETUA_HIMPUNAN' ? selectedKetuaHimpunan : selectedSekjen
    if (!selectedId) return
    setShowConfirmDialog(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Memuat data kandidat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Vote className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-xl text-foreground">HMTEKIA Election</h1>
              <p className="text-sm text-muted-foreground">Pemilihan Kahim & Sekjen</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'ketua' ? 'text-primary' : votedForKetuaHimpunan ? 'text-green-600' : 'text-muted-foreground'}`}>
              {votedForKetuaHimpunan ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center">1</div>
              )}
              <span className="font-semibold">Ketua Himpunan</span>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className={`flex items-center gap-2 ${currentStep === 'sekjen' ? 'text-primary' : votedForSekjen ? 'text-green-600' : 'text-muted-foreground'}`}>
              {votedForSekjen ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center">2</div>
              )}
              <span className="font-semibold">Sekretaris Jenderal</span>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        <div className="mb-6 space-y-4">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Voter Info */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pemilih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama</p>
                  <p className="font-semibold">{user.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{user.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIM</p>
                  <p className="font-semibold">{user.user.nim}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Alert className="mb-8">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Petunjuk Voting:</strong> Anda akan melakukan 2 kali voting - pertama untuk Ketua Himpunan, kemudian untuk Sekretaris Jenderal.
            Pilih kandidat dengan mengklik kartu, lalu klik tombol "Vote" untuk mengonfirmasi.
          </AlertDescription>
        </Alert>

        {/* Voting Section - Ketua Himpunan */}
        {currentStep === 'ketua' && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="text-base px-4 py-2">
                  Langkah 1: Pilih Ketua Himpunan
                </Badge>
              </div>
            </div>

            {ketuaHimpunanCandidates.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {ketuaHimpunanCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedKetuaHimpunan === candidate.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedKetuaHimpunan(candidate.id)}
                    >
                      <CardHeader className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <Image
                            src={candidate.photo || "/placeholder.svg?height=128&width=128"}
                            alt={candidate.name}
                            fill
                            className="rounded-full object-cover"
                          />
                          {selectedKetuaHimpunan === candidate.id && (
                            <div className="absolute -top-2 -right-2">
                              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                        <CardDescription>
                          <div className="space-y-1">
                            <p>NIM: {candidate.nim}</p>
                            <p>{candidate.prodi}</p>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Visi:</p>
                            <p className="text-sm line-clamp-3">{candidate.visi}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShowDetail(candidate)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => handleConfirmVote('KETUA_HIMPUNAN')} 
                    disabled={!selectedKetuaHimpunan || voting} 
                    className="min-w-48"
                  >
                    {voting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Menyimpan Vote...
                      </>
                    ) : (
                      <>
                        <Vote className="mr-2 h-5 w-5" />
                        Vote Ketua Himpunan
                      </>
                    )}
                  </Button>
                  {selectedKetuaHimpunan && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Anda akan memilih: <strong>{ketuaHimpunanCandidates.find((c) => c.id === selectedKetuaHimpunan)?.name}</strong>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Tidak ada kandidat Ketua Himpunan yang tersedia.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Voting Section - Sekjen */}
        {currentStep === 'sekjen' && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="text-base px-4 py-2">
                  Langkah 2: Pilih Sekretaris Jenderal
                </Badge>
              </div>
            </div>

            {sekjenCandidates.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {sekjenCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedSekjen === candidate.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedSekjen(candidate.id)}
                    >
                      <CardHeader className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <Image
                            src={candidate.photo || "/placeholder.svg?height=128&width=128"}
                            alt={candidate.name}
                            fill
                            className="rounded-full object-cover"
                          />
                          {selectedSekjen === candidate.id && (
                            <div className="absolute -top-2 -right-2">
                              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                        <CardDescription>
                          <div className="space-y-1">
                            <p>NIM: {candidate.nim}</p>
                            <p>{candidate.prodi}</p>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Visi:</p>
                            <p className="text-sm line-clamp-3">{candidate.visi}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShowDetail(candidate)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => handleConfirmVote('SEKJEN')} 
                    disabled={!selectedSekjen || voting} 
                    className="min-w-48"
                  >
                    {voting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Menyimpan Vote...
                      </>
                    ) : (
                      <>
                        <Vote className="mr-2 h-5 w-5" />
                        Vote Sekjen
                      </>
                    )}
                  </Button>
                  {selectedSekjen && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Anda akan memilih: <strong>{sekjenCandidates.find((c) => c.id === selectedSekjen)?.name}</strong>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Tidak ada kandidat Sekjen yang tersedia.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Completion Message */}
        {currentStep === 'complete' && (
          <Card className="text-center">
            <CardContent className="py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Vote Berhasil Tersimpan!</h2>
              <p className="text-muted-foreground mb-4">
                Terima kasih telah berpartisipasi dalam pemilihan HMTEKIA 2024.
              </p>
              <p className="text-sm text-muted-foreground">
                Anda akan dialihkan ke halaman sukses...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Pilihan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin memilih kandidat berikut? Pilihan tidak dapat diubah setelah dikonfirmasi.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {currentStep === 'ketua' && selectedKetuaHimpunan && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={
                            ketuaHimpunanCandidates.find((c) => c.id === selectedKetuaHimpunan)?.photo ||
                            "/placeholder.svg?height=64&width=64"
                          }
                          alt={ketuaHimpunanCandidates.find((c) => c.id === selectedKetuaHimpunan)?.name || ""}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ketua Himpunan</p>
                        <h3 className="font-semibold text-lg">
                          {ketuaHimpunanCandidates.find((c) => c.id === selectedKetuaHimpunan)?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {ketuaHimpunanCandidates.find((c) => c.id === selectedKetuaHimpunan)?.nim} •{" "}
                          {ketuaHimpunanCandidates.find((c) => c.id === selectedKetuaHimpunan)?.prodi}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {currentStep === 'sekjen' && selectedSekjen && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={
                            sekjenCandidates.find((c) => c.id === selectedSekjen)?.photo ||
                            "/placeholder.svg?height=64&width=64"
                          }
                          alt={sekjenCandidates.find((c) => c.id === selectedSekjen)?.name || ""}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Sekretaris Jenderal</p>
                        <h3 className="font-semibold text-lg">
                          {sekjenCandidates.find((c) => c.id === selectedSekjen)?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {sekjenCandidates.find((c) => c.id === selectedSekjen)?.nim} •{" "}
                          {sekjenCandidates.find((c) => c.id === selectedSekjen)?.prodi}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={voting}>
                Batal
              </Button>
              <Button 
                onClick={() => {
                  if (currentStep === 'ketua') {
                    handleVoteSubmit('KETUA_HIMPUNAN', selectedKetuaHimpunan)
                  } else if (currentStep === 'sekjen') {
                    handleVoteSubmit('SEKJEN', selectedSekjen)
                  }
                }} 
                disabled={voting}
              >
                {voting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Ya, Vote Sekarang"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Kandidat</DialogTitle>
            </DialogHeader>
            {detailCandidate && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <Image
                      src={detailCandidate.photo || "/placeholder.svg?height=96&width=96"}
                      alt={detailCandidate.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <Badge className="mb-2">
                      {detailCandidate.position === 'KETUA_HIMPUNAN' ? 'Ketua Himpunan' : 'Sekretaris Jenderal'}
                    </Badge>
                    <h3 className="text-2xl font-bold">{detailCandidate.name}</h3>
                    <p className="text-muted-foreground">
                      NIM: {detailCandidate.nim} • {detailCandidate.prodi}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Visi</h4>
                    <p className="text-sm leading-relaxed">{detailCandidate.visi}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-2">Misi</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{detailCandidate.misi}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Tutup
              </Button>
              {detailCandidate && (
                <Button
                  onClick={() => {
                    if (detailCandidate.position === 'KETUA_HIMPUNAN' && currentStep === 'ketua') {
                      setSelectedKetuaHimpunan(detailCandidate.id)
                    } else if (detailCandidate.position === 'SEKJEN' && currentStep === 'sekjen') {
                      setSelectedSekjen(detailCandidate.id)
                    }
                    setShowDetailDialog(false)
                  }}
                  disabled={voting || 
                    (detailCandidate.position === 'KETUA_HIMPUNAN' && currentStep !== 'ketua') ||
                    (detailCandidate.position === 'SEKJEN' && currentStep !== 'sekjen')
                  }
                >
                  Pilih Kandidat Ini
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
