import { forwardRef, useImperativeHandle, useRef } from 'react';

import { CreateOverlay, type CreateOverlayHandle } from '@/components/notes/new-note-overlay';
import { NewAudioNoteForm, type NewAudioNoteFormHandle } from '@/components/notes/new-audio-note-form';

export interface CreateAudioOverlayHandle {
  dismiss: () => void;
  startRecording: () => Promise<void>;
  stopAndSave: () => Promise<void>;
  stopAndDiscard: () => Promise<void>;
  markIdle: () => void;
  isRecording: () => boolean;
  getDurationSeconds: () => number;
}

interface CreateAudioOverlayProps {
  onDismiss: () => void;
  onCreated: () => void;
}

export const CreateAudioOverlay = forwardRef<CreateAudioOverlayHandle, CreateAudioOverlayProps>(
function CreateAudioOverlay({ onDismiss, onCreated }, ref) {
  const overlayRef = useRef<CreateOverlayHandle>(null);
  const formRef = useRef<NewAudioNoteFormHandle>(null);

  useImperativeHandle(ref, () => ({
    dismiss: () => overlayRef.current?.dismiss(),
    startRecording: () => formRef.current?.startRecording() ?? Promise.resolve(),
    stopAndSave: () => formRef.current?.stopAndSave() ?? Promise.resolve(),
    stopAndDiscard: () => formRef.current?.stopAndDiscard() ?? Promise.resolve(),
    markIdle: () => formRef.current?.markIdle(),
    isRecording: () => formRef.current?.isRecording() ?? false,
    getDurationSeconds: () => formRef.current?.getDurationSeconds() ?? 0,
  }));

  return (
    <CreateOverlay ref={overlayRef} onDismiss={onDismiss}>
      <NewAudioNoteForm
        ref={formRef}
        onDismiss={() => overlayRef.current?.dismiss()}
        onCreated={onCreated}
      />
    </CreateOverlay>
  );
});
