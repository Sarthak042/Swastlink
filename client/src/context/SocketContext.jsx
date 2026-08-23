import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastInventoryUpdate, setLastInventoryUpdate] = useState(null);
  const [lastBookingRequest, setLastBookingRequest] = useState(null);
  const [lastBookingStatusChange, setLastBookingStatusChange] = useState(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://swastlink-api.onrender.com');

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket.io] Connected to backend server:', newSocket.id);
    });

    newSocket.on('inventory_updated', (data) => {
      console.log('[Socket.io] Received live inventory update:', data);
      setLastInventoryUpdate(data);
    });

    newSocket.on('new_booking_request', (data) => {
      console.log('[Socket.io] Received new booking request:', data);
      setLastBookingRequest(data);
    });

    newSocket.on('booking_status_changed', (data) => {
      console.log('[Socket.io] Received booking status change:', data);
      setLastBookingStatusChange(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        lastInventoryUpdate,
        lastBookingRequest,
        lastBookingStatusChange,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
