import React, { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";

export default function SlidePanel({ open, onClose, title, children }) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-400"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-400"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-lg">
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-2xl border-l border-gray-100">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                      <DialogTitle className="text-base font-semibold text-gray-900 leading-none">
                        {title}
                      </DialogTitle>
                      <button
                        type="button"
                        className="rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1.5 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20"
                        onClick={onClose}
                        aria-label="Close panel"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 p-6 overflow-y-auto">
                      {children}
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
