<script lang="ts">
  import type { Message } from '$lib/types';

  let { message }: { message: Message } = $props();

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  let isUser = $derived(message.sender === 'user');
</script>

<div class="message-row" class:user={isUser} class:ai={!isUser}>
  {#if !isUser}
    <div class="avatar ai-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4v1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1l-1 7H10l-1-7H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2V6a4 4 0 0 1 4-4z"/>
        <circle cx="9" cy="7" r="1"/>
        <circle cx="15" cy="7" r="1"/>
      </svg>
    </div>
  {/if}

  <div class="bubble" class:user-bubble={isUser} class:ai-bubble={!isUser}>
    <p class="text">{message.text}</p>
    <span class="time">{formatTime(message.created_at)}</span>
  </div>

  {#if isUser}
    <div class="avatar user-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  {/if}
</div>

<style>
  .message-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    max-width: 85%;
    animation: slideIn 0.3s ease-out;
  }

  .message-row.user {
    align-self: flex-end;
    flex-direction: row;
  }

  .message-row.ai {
    align-self: flex-start;
    flex-direction: row;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar svg {
    width: 18px;
    height: 18px;
  }

  .ai-avatar {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
  }

  .user-avatar {
    background: linear-gradient(135deg, #2d3436, #636e72);
    color: white;
  }

  .bubble {
    padding: 12px 16px;
    border-radius: 18px;
    position: relative;
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .user-bubble {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    border-bottom-right-radius: 6px;
  }

  .ai-bubble {
    background: var(--color-surface-elevated);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-bottom-left-radius: 6px;
  }

  .text {
    margin: 0;
    font-size: 0.9375rem;
    white-space: pre-wrap;
  }

  .time {
    display: block;
    font-size: 0.7rem;
    margin-top: 6px;
    opacity: 0.6;
  }

  .user-bubble .time {
    text-align: right;
    color: rgba(255, 255, 255, 0.7);
  }

  .ai-bubble .time {
    color: var(--color-text-secondary);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
