import { forwardRef, useImperativeHandle, useRef } from 'react';

import { CreateOverlay, type CreateOverlayHandle } from '@/components/notes/new-note-overlay';
import { NewPictureNoteForm, type NewPictureNoteFormHandle } from '@/components/notes/new-picture-note-form';

export interface CreatePictureOverlayHandle {
  dismiss: () => void;
  shoot: () => void;
}

interface CreatePictureOverlayProps {
  onDismiss: () => void;
  onCreated: () => void;
}

export const CreatePictureOverlay = forwardRef<CreatePictureOverlayHandle, CreatePictureOverlayProps>(
function CreatePictureOverlay({ onDismiss, onCreated }, ref) {
  const overlayRef = useRef<CreateOverlayHandle>(null);
  const formRef = useRef<NewPictureNoteFormHandle>(null);

  useImperativeHandle(ref, () => ({
    dismiss: () => overlayRef.current?.dismiss(),
    shoot: () => {
      overlayRef.current?.activate();
      formRef.current?.takePicture();
    },
  }));

  return (
    <CreateOverlay ref={overlayRef} onDismiss={onDismiss}>
      <NewPictureNoteForm
        ref={formRef}
        onDismiss={() => overlayRef.current?.dismiss()}
        onCreated={onCreated}
      />
    </CreateOverlay>
  );
});
