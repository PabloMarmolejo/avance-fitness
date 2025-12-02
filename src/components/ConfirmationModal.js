/**
 * Confirmation Modal Component
 * Replaces native window.confirm with a styled modal
 */

export function showConfirmationModal({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) {
    const modalHTML = `
    <div class="modal confirmation-modal" style="display: block; z-index: 1000;">
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h3 style="color: var(--color-text-primary);">${title}</h3>
          <button class="modal-close" id="confirm-modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--color-text-secondary); font-size: 1.1rem;">${message}</p>
        </div>
        <div class="modal-actions" style="display: flex; gap: var(--space-md); justify-content: flex-end; margin-top: var(--space-lg);">
          <button class="btn btn-secondary" id="confirm-modal-cancel">
            ${cancelText}
          </button>
          <button class="btn btn-${type}" id="confirm-modal-confirm">
            ${confirmText}
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.querySelector('.confirmation-modal');
    const closeBtn = document.getElementById('confirm-modal-close');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    const confirmBtn = document.getElementById('confirm-modal-confirm');

    function closeModal() {
        modal.remove();
        if (onCancel) onCancel();
    }

    function handleConfirm() {
        modal.remove();
        if (onConfirm) onConfirm();
    }

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    confirmBtn.onclick = handleConfirm;

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}
