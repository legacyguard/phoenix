import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Video, StopCircle, Circle, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';import { useTranslation } from "react-i18next";

interface VideoRecorderProps {
  onVideoRecorded: (file: File) => void;
  onClose: () => void;
  maxDurationSeconds?: number;
  maxFileSizeMB?: number;
}

export function VideoRecorder({
  onVideoRecorded,
  onClose,
  maxDurationSeconds = 300, // 5 minutes default
  maxFileSizeMB = 500 // 500MB default
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  // Initialize camera and microphone
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Set up MediaRecorder
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ?
        'video/webm;codecs=vp9,opus' :
        'video/webm';

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          setRecordedBlob(blob);
          chunksRef.current = [];
        };

        mediaRecorderRef.current = mediaRecorder;
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError(t("TimeCapsule.videoRecorder.unable_to_access_camera_or_mic_1"));
      }
    };

    initializeMedia();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'inactive') {
      return;
    }

    setError(null);
    setRecordedBlob(null);
    chunksRef.current = [];
    setRecordingDuration(0);

    mediaRecorderRef.current.start(1000); // Collect data every second
    setIsRecording(true);

    // Start duration timer
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => {
        const newDuration = prev + 1;

        // Auto-stop if max duration reached
        if (newDuration >= maxDurationSeconds) {
          stopRecording();
        }

        return newDuration;
      });
    }, 1000);
  }, [maxDurationSeconds, stopRecording]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return;
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSaveVideo = useCallback(async () => {
    if (!recordedBlob) return;

    // Check file size
    const fileSizeMB = recordedBlob.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      setError(`Video file is too large (${fileSizeMB.toFixed(1)}MB). Maximum allowed is ${maxFileSizeMB}MB.`);
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Create a File object from the blob
      const fileName = `time_capsule_video_${Date.now()}.webm`;
      const file = new File([recordedBlob], fileName, {
        type: recordedBlob.type,
        lastModified: Date.now()
      });

      // Simulate upload progress (actual progress will be handled by parent component)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Pass the file to parent component
      onVideoRecorded(file);

      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
      }, 2000);
    } catch (err) {
      console.error('Error processing video:', err);
      setError(t("TimeCapsule.videoRecorder.failed_to_process_video_please_2"));
      setIsProcessing(false);
    }
  }, [recordedBlob, maxFileSizeMB, onVideoRecorded]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setRecordingDuration(0);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">{t("TimeCapsule.videoRecorder.record_video_message_3")}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100">

            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error &&
          <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          }

          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-[400px] object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror effect
            />
            
            {/* Recording indicator */}
            {isRecording &&
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            }

            {/* Duration */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium">
                {formatDuration(recordingDuration)} / {formatDuration(maxDurationSeconds)}
              </span>
            </div>
          </div>

          {/* Recording info */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">{t("TimeCapsule.videoRecorder.maximum_recording_duration_4")}
              {formatDuration(maxDurationSeconds)}
            </p>
            <p className="text-sm text-gray-600">{t("TimeCapsule.videoRecorder.maximum_file_size_5")}
              {maxFileSizeMB}MB
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!recordedBlob ?
            <>
                {!isRecording ?
              <Button
                size="lg"
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white">

                    <Circle className="h-5 w-5 mr-2" />{t("TimeCapsule.videoRecorder.start_recording_6")}

              </Button> :

              <Button
                size="lg"
                onClick={stopRecording}
                className="bg-gray-900 hover:bg-gray-800 text-white">

                    <StopCircle className="h-5 w-5 mr-2" />{t("TimeCapsule.videoRecorder.stop_recording_7")}

              </Button>
              }
              </> :

            <>
                <Button
                variant="outline"
                size="lg"
                onClick={handleRetake}
                disabled={isProcessing}>

                  <Video className="h-5 w-5 mr-2" />
                  Retake
                </Button>
                <Button
                size="lg"
                onClick={handleSaveVideo}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90">

                  {isProcessing ?
                <>
                      <Upload className="h-5 w-5 mr-2 animate-pulse" />{t("ocr.hybridDocumentProcessor.processing_6")}

                </> :

                <>
                      <Upload className="h-5 w-5 mr-2" />{t("TimeCapsule.videoRecorder.use_this_video_9")}

                </>
                }
                </Button>
              </>
            }
          </div>

          {/* Upload Progress */}
          {isProcessing && uploadProgress > 0 &&
          <div className="mt-6">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-600 text-center mt-2">{t("TimeCapsule.videoRecorder.processing_video_10")}
              {uploadProgress}%
              </p>
            </div>
          }
        </div>
      </div>
    </div>);

}