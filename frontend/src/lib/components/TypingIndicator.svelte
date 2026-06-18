<script lang="ts">
  // Animated typing indicator with bouncing dots
</script>

<div class="typing-container">
  <div class="typing-avatar">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4v1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1l-1 7H10l-1-7H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2V6a4 4 0 0 1 4-4z"/>
      <circle cx="9" cy="7" r="1"/>
      <circle cx="15" cy="7" r="1"/>
    </svg>
  </div>
  <div class="typing-bubble">
    <span class="typing-text">Luna is typing</span>
    <div class="dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</div>

<style>
  .typing-container {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    align-self: flex-start;
    animation: fadeIn 0.3s ease-out;
  }

  .typing-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
  }

  .typing-avatar svg {
    width: 18px;
    height: 18px;
  }

  .typing-bubble {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    padding: 12px 16px;
    border-radius: 18px;
    border-bottom-left-radius: 6px;
  }

  .typing-text {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .dots {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-text-secondary);
    animation: bounce 1.4s ease-in-out infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-6px);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
