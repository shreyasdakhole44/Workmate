import React, { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };
  const widthClass = sizeClasses[size] || sizeClasses.md;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop with blur */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4 text-center">
            {/* Modal panel transition */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className={`relative transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white text-left shadow-xl transition-all w-full sm:${widthClass} max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-gray-100`}>
                {/* Sticky Header */}
                <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10 shrink-0">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900 leading-none">
                    {title}
                  </DialogTitle>
                  <button
                    type="button"
                    className="rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2.5 sm:p-1.5 -m-1 sm:m-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-6">
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
