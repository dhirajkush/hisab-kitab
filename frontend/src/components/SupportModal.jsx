import React from "react";
import { X, Mail, Phone } from "lucide-react";
import { modalStyles as s } from "../assets/dummyStyles";

const SUPPORT_EMAIL = "support@hisabkitab.com.np";
const SUPPORT_PHONE_DISPLAY = "+977 986-9221177";
const SUPPORT_PHONE_TEL = "+9779869221177";

const SupportModal = ({ onClose }) => (
  <div className={s.overlay} onClick={onClose}>
    <div className={s.modalContainer} onClick={(e) => e.stopPropagation()}>
      <div className={s.modalHeader}>
        <h2 className={s.modalTitle}>Contact Support</h2>
        <button onClick={onClose} className={s.closeButton}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Have a question or ran into an issue? Reach out any time.
      </p>

      <div className="space-y-3">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="p-2 bg-teal-100 rounded-lg">
            <Mail className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-800">{SUPPORT_EMAIL}</p>
          </div>
        </a>

        <a
          href={`tel:${SUPPORT_PHONE_TEL}`}
          className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="p-2 bg-teal-100 rounded-lg">
            <Phone className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-800">{SUPPORT_PHONE_DISPLAY}</p>
          </div>
        </a>
      </div>
    </div>
  </div>
);

export default SupportModal;
