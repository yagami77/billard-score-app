const getSocketUrl = () => {
    if (typeof window !== 'undefined') {
        // En développement local
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3001';
        }

        // En production, utiliser le domaine actuel
        return window.location.origin;
    }
    return 'http://localhost:3001';
};

export const useSocket = (roomCode: string, onStateUpdate: SocketCallback) => {
    const socketRef = useRef<Socket | null>(null);

    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        const socketUrl = getSocketUrl();
        console.log('🔌 Tentative de connexion à:', socketUrl);

        socketRef.current = io(socketUrl, {
            path: '/api/ws/socket.io',
            transports: ['polling'],  // Uniquement polling pour le moment
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            timeout: 10000,
            autoConnect: true
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Connecté au serveur');
            socket.emit('joinRoom', roomCode);
        });

        socket.on('stateUpdate', (newState: GameState) => {
            console.log('📥 Mise à jour reçue:', newState);
            onStateUpdate(newState);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Erreur de connexion:', error);
        });

        socket.io.on("error", (error) => {
            console.error('🚨 Erreur IO:', error);
        });

        socket.connect();
    }, [roomCode, onStateUpdate]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [connect]);

    const emitStateUpdate = useCallback((newState: GameState) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('updateState', roomCode, newState);
    }, [roomCode]);

    return { emitStateUpdate };
};