import { forwardRef, useImperativeHandle, useRef } from 'react';

import { CreateOverlay, type CreateOverlayHandle } from '@/components/notes/new-note-overlay';
import { NewTextNoteForm, type NewTextNoteFormHandle } from '@/components/notes/new-text-note-form';

export interface CreateNoteOverlayHandle {
  dismiss: () => void;
  focus: () => void;
}

interface CreateNoteOverlayProps {
  onDismiss: () => void;
  onCreated: () => void;
}

export const CreateNoteOverlay = forwardRef<CreateNoteOverlayHandle, CreateNoteOverlayProps>(
function CreateNoteOverlay({ onDismiss, onCreated }, ref) {
  const overlayRef = useRef<CreateOverlayHandle>(null);
  const formRef = useRef<NewTextNoteFormHandle>(null);

  useImperativeHandle(ref, () => ({
    dismiss: () => overlayRef.current?.dismiss(),
    focus: () => {
      overlayRef.current?.activate();
      formRef.current?.focus();
    },
  }));

  return (
    <CreateOverlay ref={overlayRef} onDismiss={onDismiss}>
      <NewTextNoteForm
        ref={formRef}
        onDismiss={() => overlayRef.current?.dismiss()}
        onCreated={onCreated}
      />
    </CreateOverlay>
  );
});
