import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { toast } from 'sonner';
import { useUIStore } from '@/stores/ui-store';
import { apiClientManager } from '@/lib/api/api-client-manager';

export function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [, setIsConnected] = useState(false);
  const { theme } = useUIStore();

  // Detect actual theme (resolve 'system')
  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const isDark = getEffectiveTheme() === 'dark';

  useEffect(() => {
    if (!terminalRef.current) return;

    // Theme-aware colors - GRC will provide command-specific colors
    const terminalTheme = isDark ? {
      background: '#0a0a0a',
      foreground: '#e5e5e5',
      cursor: '#e5e5e5',
      selectionBackground: '#264f78',
      black: '#000000',
      red: '#cd3131',
      green: '#0dbc79',
      yellow: '#e5e510',
      blue: '#2472c8',
      magenta: '#bc3fbc',
      cyan: '#11a8cd',
      white: '#e5e5e5',
      brightBlack: '#666666',
      brightRed: '#f14c4c',
      brightGreen: '#23d18b',
      brightYellow: '#f5f543',
      brightBlue: '#3b8eea',
      brightMagenta: '#d670d6',
      brightCyan: '#29b8db',
      brightWhite: '#ffffff',
    } : {
      background: '#ffffff',
      foreground: '#1e1e1e',
      cursor: '#1e1e1e',
      selectionBackground: '#add6ff',
      black: '#000000',
      red: '#cd3131',
      green: '#00bc00',
      yellow: '#949800',
      blue: '#0451a5',
      magenta: '#bc05bc',
      cyan: '#0598bc',
      white: '#555555',
      brightBlack: '#666666',
      brightRed: '#cd3131',
      brightGreen: '#14ce14',
      brightYellow: '#b5ba00',
      brightBlue: '#0451a5',
      brightMagenta: '#bc05bc',
      brightCyan: '#0598bc',
      brightWhite: '#a5a5a5',
    };

    // Create terminal instance
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: terminalTheme,
      allowProposedApi: true,
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    // Store refs
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect to WebSocket terminal
    const config = apiClientManager.getUnshackleClient();
    const baseURL = config.getBaseURL();
    const wsURL = baseURL.replace(/^http/, 'ws') + '/api/terminal';
    
    try {
      const ws = new WebSocket(wsURL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        toast.success('Terminal connected');
        
        // Send terminal size
        ws.send(JSON.stringify({
          type: 'resize',
          cols: term.cols,
          rows: term.rows,
        }));
      };

      ws.onmessage = (event) => {
        // Write data from server to terminal (includes .bashrc output)
        term.write(event.data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        toast.error('Terminal connection error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        toast.info('Terminal disconnected');
      };

      // Send user input to server
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
    } catch (error) {
      console.error('Failed to connect to terminal:', error);
      setIsConnected(false);
      toast.error('Failed to connect to terminal');
    }

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        fitAddonRef.current.fit();
        wsRef.current.send(JSON.stringify({
          type: 'resize',
          cols: term.cols,
          rows: term.rows,
        }));
      }
    };

    // Fit to container on mount and window resize
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (wsRef.current) {
        wsRef.current.close();
      }
      term.dispose();
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 top-16 left-64 p-2">
      <div 
        ref={terminalRef} 
        className="h-full w-full"
      />
    </div>
  );
}
