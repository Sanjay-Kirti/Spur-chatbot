<script lang="ts">
  let { disabled = false, maxLength = 2000, onsend }: {
    disabled?: boolean;
    maxLength?: number;
    onsend: (text: string) => void;
  } = $props();

  let inputText = $state('');

  let charCount = $derived(inputText.length);
  let isNearLimit = $derived(charCount > maxLength * 0.8);
  let isOverLimit = $derived(charCount > maxLength);
  let canSend = $derived(inputText.trim().length > 0 && !disabled && !isOverLimit);

  function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;
    onsend(trimmed);
    inputText = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<div class="input-container">
  <div class="input-wrapper">
    <textarea
      bind:value={inputText}
      onkeydown={handleKeydown}
      placeholder="Type your message..."
      {disabled}
      rows={1}
      class="message-input"
      class:over-limit={isOverLimit}
      id="chat-message-input"
    ></textarea>

    {#if isNearLimit}
      <span class="char-count" class:over={isOverLimit}>
        {charCount}/{maxLength}
      </span>
    {/if}
  </div>

  <button
    onclick={handleSend}
    disabled={!canSend}
    class="send-button"
    id="chat-send-button"
    aria-label="Send message"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  </button>
</div>

<style>
  .input-container {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    padding: 16px 20px;
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
  }

  .input-wrapper {
    flex: 1;
    position: relative;
  }

  .message-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--color-border);
    border-radius: 24px;
    background: var(--color-surface-elevated);
    color: var(--color-text-primary);
    font-size: 0.9375rem;
    font-family: inherit;
    resize: none;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    line-height: 1.5;
    max-height: 120px;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .message-input::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.6;
  }

  .message-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
  }

  .message-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .message-input.over-limit {
    border-color: #e74c3c;
  }

  .char-count {
    position: absolute;
    right: 16px;
    bottom: -20px;
    font-size: 0.7rem;
    color: var(--color-text-secondary);
    transition: color 0.2s;
  }

  .char-count.over {
    color: #e74c3c;
    font-weight: 600;
  }

  .send-button {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
  }

  .send-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
  }

  .send-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .send-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .send-button svg {
    width: 20px;
    height: 20px;
  }
</style>
