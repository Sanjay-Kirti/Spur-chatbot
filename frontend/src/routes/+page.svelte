<script lang="ts">
  import ChatWidget from '$lib/components/ChatWidget.svelte';
</script>

<svelte:head>
  <title>Lunara Support | Chat with Luna</title>
  <meta name="description" content="Chat with Luna, your AI-powered support assistant for Lunara artisan home goods. Get instant help with shipping, returns, and more." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="page">
  <div class="background-decoration">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>

  <main class="main-content">
    <div class="brand-header">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Lunara</span>
      </div>
      <p class="tagline">Artisan home goods, crafted with care ✨</p>
    </div>

    <div class="chat-container">
      <ChatWidget />
    </div>

    <footer class="footer">
      <p>Powered by <strong>Spur</strong> · AI Customer Engagement</p>
    </footer>
  </main>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
    background: var(--color-background);
  }

  /* Animated background orbs */
  .background-decoration {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: float 20s ease-in-out infinite;
  }

  .orb-1 {
    width: 500px;
    height: 500px;
    background: #6c5ce7;
    top: -100px;
    right: -100px;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 400px;
    height: 400px;
    background: #a29bfe;
    bottom: -80px;
    left: -80px;
    animation-delay: -7s;
  }

  .orb-3 {
    width: 300px;
    height: 300px;
    background: #fd79a8;
    top: 50%;
    left: 50%;
    animation-delay: -14s;
  }

  .main-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 480px;
  }

  /* Brand Header */
  .brand-header {
    text-align: center;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .logo svg {
    width: 28px;
    height: 28px;
    color: var(--color-primary);
  }

  .tagline {
    margin: 4px 0 0;
    font-size: 0.88rem;
    color: var(--color-text-secondary);
    font-weight: 400;
  }

  /* Chat Container */
  .chat-container {
    width: 100%;
    height: 600px;
  }

  /* Footer */
  .footer {
    text-align: center;
  }

  .footer p {
    font-size: 0.78rem;
    color: var(--color-text-secondary);
    opacity: 0.6;
    margin: 0;
  }

  .footer strong {
    color: var(--color-primary);
    font-weight: 600;
  }

  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -30px) scale(1.05);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.95);
    }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .page {
      padding: 10px;
      align-items: stretch;
    }

    .main-content {
      max-width: 100%;
      height: 100%;
    }

    .chat-container {
      height: calc(100vh - 140px);
      flex: 1;
    }

    .brand-header {
      padding-top: 8px;
    }

    .logo {
      font-size: 1.3rem;
    }
  }

  @media (min-height: 800px) {
    .chat-container {
      height: 680px;
    }
  }
</style>
