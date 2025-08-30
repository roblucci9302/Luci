import React, { useState, useEffect, useRef } from "react"
import { IoLogOutOutline } from "react-icons/io5"

interface QueueCommandsProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void
  onAudioResultVisibilityChange: (visible: boolean) => void
  screenshots: Array<{ path: string; preview: string }>
}

const QueueCommands: React.FC<QueueCommandsProps> = ({
  onTooltipVisibilityChange,
  onAudioResultVisibilityChange,
  screenshots
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioResult, setAudioResult] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const chunks = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction pour formater le temps d'enregistrement
  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    let tooltipHeight = 0
    if (tooltipRef.current && isTooltipVisible) {
      tooltipHeight = tooltipRef.current.offsetHeight + 10
    }
    onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)
  }, [isTooltipVisible])

  // Force re-render when audioResult changes
  useEffect(() => {
    if (audioResult) {
      console.log('🎤 Résultat audio mis à jour:', audioResult)
      // Force a small delay to ensure UI updates
      setTimeout(() => {
        // Trigger a re-render by updating a state
        setIsAnalyzing(false)
      }, 100)
    }
  }, [audioResult])

  // Notify parent when audio result visibility changes
  useEffect(() => {
    const isVisible = !!(audioResult || isAnalyzing)
    onAudioResultVisibilityChange(isVisible)
  }, [audioResult, isAnalyzing, onAudioResultVisibilityChange])

  const handleMouseEnter = () => {
    setIsTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
  }

  const handleRecordClick = async () => {
    if (!isRecording) {
      // Start recording
      try {
        console.log('🎤 Début enregistrement...')
        setAudioResult(null) // Clear previous result
        setIsAnalyzing(false)
        
        // Optimized audio constraints for better quality
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 1
          } 
        })
        
        // Optimized MediaRecorder configuration
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
        
        const recorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          audioBitsPerSecond: 128000 // Higher bitrate for better quality
        })
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.current.push(e.data)
          }
        }
        
        recorder.onstop = async () => {
          console.log('🎤 Enregistrement arrêté, analyse en cours...')
          setIsAnalyzing(true)
          setRecordingTime(0)
          
          // Clear recording timer
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current)
            recordingTimerRef.current = null
          }
          
          // Stop all audio tracks to release microphone
          stream.getTracks().forEach(track => track.stop())
          
          const blob = new Blob(chunks.current, { type: mimeType })
          chunks.current = []
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1]
            try {
              console.log('🎤 Envoi pour analyse...')
              const result = await window.electronAPI.analyzeAudioFromBase64(base64Data, mimeType)
              console.log('🎤 Résultat reçu:', result.text)
              setAudioResult(result.text)
            } catch (err) {
              console.error('🎤 Erreur analyse:', err)
              setAudioResult('Analyse audio échouée.')
            } finally {
              setIsAnalyzing(false)
            }
          }
          reader.readAsDataURL(blob)
        }
        
        setMediaRecorder(recorder)
        recorder.start(1000) // Start with 1-second intervals for better chunk management
        setIsRecording(true)
        setRecordingTime(0)
        
        // Start recording timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } catch (err) {
        console.error('🎤 Erreur démarrage enregistrement:', err)
        setAudioResult('Impossible de démarrer l\'enregistrement.')
      }
    } else {
      // Stop recording
      console.log('🎤 Arrêt enregistrement...')
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      setIsRecording(false)
      setRecordingTime(0)
      
      // Clear recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
      
      setMediaRecorder(null)
    }
  }

  return (
    <div className="pt-2 w-fit">
      <div className="text-xs text-white/90 backdrop-blur-md bg-black/60 rounded-lg py-2 px-4 flex items-center justify-center gap-4">
        {/* Afficher/Masquer */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] leading-none">Afficher/Masquer</span>
          <div className="flex gap-1">
            <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
              ⌘
            </button>
            <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
              B
            </button>
          </div>
        </div>

        {/* Capture d'écran */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] leading-none truncate">
            {screenshots.length === 0 ? "Première capture" : "Capture d'écran"}
          </span>
          <div className="flex gap-1">
            <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
              ⌘
            </button>
            <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
              H
            </button>
          </div>
        </div>

        {/* Résoudre */}
        {screenshots.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] leading-none">Résoudre</span>
            <div className="flex gap-1">
              <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                ⌘
              </button>
              <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none text-white/70">
                ↵
              </button>
            </div>
          </div>
        )}

        {/* Voice Recording Button - Design adapté au header */}
        <div className="flex items-center gap-2">
          {/* Bouton d'enregistrement circulaire */}
          <button
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500/70 hover:bg-red-500/90' 
                : 'bg-white/10 hover:bg-white/20 backdrop-blur-md'
            }`}
            onClick={handleRecordClick}
            type="button"
            disabled={isAnalyzing}
          >
            {isRecording ? (
              // Icône stop (carré blanc)
              <div className="w-2 h-2 bg-white/90 rounded-sm"></div>
            ) : isAnalyzing ? (
              // Icône de chargement
              <div className="w-2 h-2 border border-white/90 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              // Icône microphone
              <svg className="w-3 h-3 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </button>
          
          {/* Compteur de temps */}
          {isRecording && (
            <span className="text-white/90 text-xs font-light tracking-wide">
              {formatRecordingTime(recordingTime)}
            </span>
          )}
        </div>

        {/* Question mark with tooltip */}
        <div
          className="relative inline-block"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center justify-center cursor-help z-10">
            <span className="text-xs text-white/70">?</span>
          </div>

          {/* Tooltip Content */}
          {isTooltipVisible && (
            <div
              ref={tooltipRef}
              className="absolute top-full right-0 mt-2 w-80"
            >
              <div className="p-3 text-xs bg-black/80 backdrop-blur-md rounded-lg border border-white/10 text-white/90 shadow-lg">
                                  <div className="space-y-4">
                    <h3 className="font-medium truncate">Raccourcis clavier</h3>
                    <div className="space-y-3">
                      {/* Commande Toggle */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate">Basculer fenêtre</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              ⌘
                            </span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              B
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate">
                          Afficher ou masquer cette fenêtre.
                        </p>
                      </div>
                      {/* Commande Capture d'écran */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate">Prendre une capture</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              ⌘
                            </span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              H
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate">
                          Prendre une capture d'écran du problème. L'outil
                          extraira et analysera le problème. Les 5 dernières
                          captures sont sauvegardées.
                        </p>
                      </div>

                      {/* Commande Résoudre */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate">Résoudre le problème</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              ⌘
                            </span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] leading-none">
                              ↵
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-white/70 truncate">
                          Générer une solution basée sur le problème actuel.
                        </p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="mx-2 h-4 w-px bg-white/20" />

        {/* Sign Out Button - Moved to end */}
        <button
          className="text-red-500/70 hover:text-red-500/90 transition-colors hover:cursor-pointer"
          title="Sign Out"
          onClick={() => window.electronAPI.quitApp()}
        >
          <IoLogOutOutline className="w-4 h-4" />
        </button>
      </div>
      {/* Audio Result Display - Interface document/note avec glassmorphism */}
      {(audioResult || isAnalyzing) && (
        <div className="mt-4">
          {/* Document Container avec même design que le header d'instructions */}
          <div className="text-xs text-white/90 backdrop-blur-md bg-black/60 rounded-lg py-2 px-4 overflow-hidden">


            {/* Document Content avec glassmorphism */}
            <div className="p-4 space-y-4">
              {/* Response Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Filtres pour les effets de lueur */}
                      <defs>
                        <filter id="neonGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        
                        {/* Dégradé cyan vers bleu pour le croissant */}
                        <linearGradient id="crescentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{stopColor: '#00ffff', stopOpacity: 1}} />
                          <stop offset="100%" style={{stopColor: '#0066ff', stopOpacity: 1}} />
                        </linearGradient>
                        
                        {/* Dégradé pour l'étoile */}
                        <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
                          <stop offset="70%" style={{stopColor: '#ffffff', stopOpacity: 0.8}} />
                          <stop offset="100%" style={{stopColor: '#0066ff', stopOpacity: 0.6}} />
                        </radialGradient>
                      </defs>
                      
                      {/* Croissant de lune très fin avec lueur néon */}
                      <path d="M8 12C8 10 9 8 12 8C15 8 16 10 16 12C16 14 15 16 12 16C9 16 8 14 8 12Z" 
                            fill="url(#crescentGradient)" 
                            filter="url(#neonGlow)"
                            opacity="0.9"/>
                      
                      {/* Étoile à 8 branches brillante */}
                      <path d="M15 8L16 6L17 8L19 9L17 10L16 12L15 10L13 9L15 8Z" 
                            fill="url(#starGradient)"
                            filter="url(#neonGlow)"/>
                      
                      {/* Halo lumineux autour de l'étoile */}
                      <circle cx="16" cy="9" r="3" 
                              fill="none" 
                              stroke="#0066ff" 
                              strokeWidth="0.5"
                              opacity="0.6"
                              filter="url(#neonGlow)"/>
                    </svg>
                  </div>
                  <h4 className="text-white/90 font-medium text-sm">Réponse de Lucide</h4>
                </div>
                
                {isAnalyzing ? (
                  <div className="rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-white/90 text-sm">Analyse en cours...</span>
                    </div>
                  </div>
                ) : audioResult && (
                  <div className="rounded-lg p-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {audioResult.includes('Transcription:') 
                          ? audioResult.replace('Transcription:', '').trim()
                          : audioResult
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Footer sans bordure */}
              <div className="pt-3">
                <div className="flex items-center justify-between text-xs text-white/90">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span>Assistant prêt</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueueCommands
