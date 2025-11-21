"use client"

import { useState, useEffect } from "react"

// Prevent static generation - this page requires authentication
export const dynamic = 'force-dynamic'
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
import { Vote, CheckCircle, Loader2, AlertCircle, Eye, User as UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Candidate {
  id: string
  name: string
  nim: string
  prodi: string
  position: 'KETUA_BPH' | 'SENATOR'
  visi: string
  misi: string
  photo?: string
  isActive: boolean
}

interface MeUser {
  id: string
  name: string
  nim: string
  role: string
  hasVoted: boolean
  hasVotedKetuaBPH: boolean
  hasVotedSenator: boolean
}

interface MeResponse {
  user: MeUser
}

export default function VotePage() {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [candidatesKetuaBPH, setCandidatesKetuaBPH] = useState<Candidate[]>([])
  const [candidatesSenator, setCandidatesSenator] = useState<Candidate[]>([])
  const [selectedKetuaBPH, setSelectedKetuaBPH] = useState<string>("")
  const [selectedSenator, setSelectedSenator] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmPosition, setConfirmPosition] = useState<'KETUA_BPH' | 'SENATOR' | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null)
  const [activeTab, setActiveTab] = useState<string>("ketua-bph")
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

        // Check if user completed both votes
        if (userData.user?.hasVotedKetuaBPH && userData.user?.hasVotedSenator) {
          console.log('User completed all votes, redirecting to /success')
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
        
        // Separate candidates by position
        const ketuaBPH = allCandidates.filter((c: Candidate) => c.position === 'KETUA_BPH')
        const senator = allCandidates.filter((c: Candidate) => c.position === 'SENATOR')
        
        setCandidatesKetuaBPH(ketuaBPH)
        setCandidatesSenator(senator)

        if (allCandidates.length === 0) {
          setError('Tidak ada kandidat yang tersedia saat ini')
        }

        // Set active tab based on what user hasn't voted for
        if (!userData.user?.hasVotedKetuaBPH) {
          setActiveTab("ketua-bph")
        } else if (!userData.user?.hasVotedSenator) {
          setActiveTab("senator")
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

  const handleVoteSubmit = async () => {
    if (!confirmPosition || !user) return

    const candidateId = confirmPosition === 'KETUA_BPH' ? selectedKetuaBPH : selectedSenator
    if (!candidateId) return

    setVoting(true)
    setError("")
    setSuccess("")

    try {
      console.log(`Submitting vote for ${confirmPosition}:`, candidateId)

      const response = await fetch('/api/vote', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          position: confirmPosition
        })
      })

      const data = await response.json()
      console.log('Vote response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote')
      }

      setSuccess(`Vote ${confirmPosition === 'KETUA_BPH' ? 'Ketua BPH' : 'Senator'} berhasil disimpan!`)
      
      // Update local user state
      if (user) {
        const updatedUser = { ...user.user }
        if (confirmPosition === 'KETUA_BPH') {
          updatedUser.hasVotedKetuaBPH = true
        } else {
          updatedUser.hasVotedSenator = true
        }
        updatedUser.hasVoted = updatedUser.hasVotedKetuaBPH && updatedUser.hasVotedSenator
        setUser({ user: updatedUser })
      }

      setShowConfirmDialog(false)

      // Check if both votes are complete
      const bothVotesComplete = 
        (confirmPosition === 'KETUA_BPH' && user.user.hasVotedSenator) ||
        (confirmPosition === 'SENATOR' && user.user.hasVotedKetuaBPH)

      if (bothVotesComplete) {
        // Redirect to success page
        setTimeout(() => router.push("/success"), 1500)
      } else {
        // Switch to the other tab
        setActiveTab(confirmPosition === 'KETUA_BPH' ? 'senator' : 'ketua-bph')
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

  const handleConfirmVote = (position: 'KETUA_BPH' | 'SENATOR') => {
    const candidateId = position === 'KETUA_BPH' ? selectedKetuaBPH : selectedSenator
    if (!candidateId) return
    
    setConfirmPosition(position)
    setShowConfirmDialog(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memuat data kandidat...</p>
        </div>
      </div>
    )
  }

  const CandidateCard = ({ 
    candidate, 
    selected, 
    onSelect, 
    disabled 
  }: { 
    candidate: Candidate
    selected: boolean
    onSelect: () => void
    disabled: boolean
  }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        selected 
          ? 'ring-2 ring-primary shadow-lg' 
          : 'hover:shadow-md'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {candidate.photo ? (
              <Image 
                src={candidate.photo} 
                alt={candidate.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">{candidate.name}</h3>
            <p className="text-sm text-muted-foreground mb-1">NIM: {candidate.nim}</p>
            <p className="text-sm text-muted-foreground mb-3">{candidate.prodi}</p>
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleShowDetail(candidate)
              }}
              className="w-full sm:w-auto"
            >
              <Eye className="h-4 w-4 mr-2" />
              Lihat Visi & Misi
            </Button>
          </div>
          
          {selected && (
            <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image 
              src="/logo.jpeg" 
              alt="HIMATEKIA 2025" 
              width={48} 
              height={48} 
              className="rounded-lg"
            />
            <div className="text-left">
              <h1 className="font-bold text-xl">PEMIRA HIMATEKIA-ITERA 2025</h1>
              <p className="text-sm text-muted-foreground">Pilih Kandidat Anda</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{user.user.name}</p>
                  <p className="text-sm text-muted-foreground">NIM: {user.user.nim}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="flex gap-2">
                    <span className={user.user.hasVotedKetuaBPH ? "text-green-600" : "text-muted-foreground"}>
                      {user.user.hasVotedKetuaBPH ? "✓" : "○"} Ketua BPH
                    </span>
                    <span className={user.user.hasVotedSenator ? "text-green-600" : "text-muted-foreground"}>
                      {user.user.hasVotedSenator ? "✓" : "○"} Senator
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Voting Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ketua-bph" disabled={user?.user.hasVotedKetuaBPH}>
              Ketua BPH {user?.user.hasVotedKetuaBPH && "✓"}
            </TabsTrigger>
            <TabsTrigger value="senator" disabled={user?.user.hasVotedSenator}>
              Senator {user?.user.hasVotedSenator && "✓"}
            </TabsTrigger>
          </TabsList>

          {/* Ketua BPH Tab */}
          <TabsContent value="ketua-bph" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Kandidat Ketua BPH</CardTitle>
                <CardDescription>
                  Pilih satu kandidat untuk Ketua Badan Pengurus Harian
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidatesKetuaBPH.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Belum ada kandidat Ketua BPH yang tersedia
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {candidatesKetuaBPH.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        selected={selectedKetuaBPH === candidate.id}
                        onSelect={() => setSelectedKetuaBPH(candidate.id)}
                        disabled={!!user?.user.hasVotedKetuaBPH}
                      />
                    ))}

                    {!user?.user.hasVotedKetuaBPH && (
                      <Button
                        onClick={() => handleConfirmVote('KETUA_BPH')}
                        disabled={!selectedKetuaBPH || voting}
                        className="w-full"
                        size="lg"
                      >
                        {voting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Vote className="mr-2 h-4 w-4" />
                            Vote Ketua BPH
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Senator Tab */}
          <TabsContent value="senator" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Kandidat Senator</CardTitle>
                <CardDescription>
                  Pilih satu kandidat untuk Senator HIMATEKIA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidatesSenator.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Belum ada kandidat Senator yang tersedia
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {candidatesSenator.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        selected={selectedSenator === candidate.id}
                        onSelect={() => setSelectedSenator(candidate.id)}
                        disabled={!!user?.user.hasVotedSenator}
                      />
                    ))}

                    {!user?.user.hasVotedSenator && (
                      <Button
                        onClick={() => handleConfirmVote('SENATOR')}
                        disabled={!selectedSenator || voting}
                        className="w-full"
                        size="lg"
                      >
                        {voting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Vote className="mr-2 h-4 w-4" />
                            Vote Senator
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirm Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Vote</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin dengan pilihan Anda? Vote tidak dapat diubah setelah dikonfirmasi.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={voting}
              >
                Batal
              </Button>
              <Button
                onClick={handleVoteSubmit}
                disabled={voting}
              >
                {voting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Ya, Saya Yakin'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detailCandidate?.name}</DialogTitle>
              <DialogDescription>
                {detailCandidate?.nim} - {detailCandidate?.prodi}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {detailCandidate?.photo && (
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden">
                  <Image 
                    src={detailCandidate.photo} 
                    alt={detailCandidate.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Visi:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {detailCandidate?.visi}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Misi:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {detailCandidate?.misi}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
