import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={`w-full ${SIZE_CLASSES[size]} rounded-2xl bg-surface shadow-card`}>
              <div className="flex items-center justify-between border-b border-line-2 px-5 py-4">
                <Dialog.Title className="text-[15px] font-semibold text-ink">{title}</Dialog.Title>
                <button type="button" onClick={onClose} className="text-muted hover:text-ink" aria-label="Fechar">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
              {footer && <div className="flex justify-end gap-2 border-t border-line-2 px-5 py-4">{footer}</div>}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
