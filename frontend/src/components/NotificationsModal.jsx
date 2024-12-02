import React, { useState, useEffect } from 'react';

function NotificationsModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(() => {
        // Retrieve notifications from localStorage on initial load
        const storedNotifications = localStorage.getItem('notifications');
        return storedNotifications ? JSON.parse(storedNotifications) : [];
    });

    useEffect(() => {
        // Establish WebSocket connection
        const ws = new WebSocket('ws://localhost:4000');

        // Listen for messages from the server
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);

            // Only add relevant notifications
            if (['eventCreated', 'userSignedUp', 'eventLiked'].includes(message.type)) {
                console.log("notifications", notifications)
                const updatedNotifications = [...notifications, message];
                console.log("updatedNotifications", updatedNotifications)
                setNotifications(updatedNotifications);

                // Save to localStorage
                localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        // Clean up WebSocket connection on component unmount
        return () => ws.close();
    }, []);

    console.log("notifications", notifications)

    return (
        <div>
            {/* Button to Open Modal */}
            {/* <button 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
        Show Notifications
      </button> */}

            <div
                onClick={() => setIsOpen(true)} >
                <div className='flex flex-col place-items-center py-1 px-3 rounded cursor-pointer hover:text-primarydark hover:bg-white hover:shadow-sm shadow-gray-200 hover:transition-shadow duration-1500'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 py-1">
                        <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
                    </svg>
                    <div>Notifications</div>
                </div>
            </div>

            {/* Modal */}
            {isOpen && (

                <div className="bg-gray-100 fixed min-h-screen flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white w-96 rounded-lg shadow-lg">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-300">
                                <h2 className="text-lg font-semibold">Notifications</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none">
                                    &times;
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4">
                                <ul className="space-y-3">
                                    {notifications.toReversed().map((notification, index) => (
                                        <li
                                            key={index}
                                            className={`p-3 rounded-lg ${notification.type === 'eventCreated' ? 'bg-blue-100' :
                                                notification.type === 'userSignedUp' ? 'bg-green-100' :
                                                    'bg-yellow-100'
                                                }`}
                                        >
                                            {notification.content}
                                        </li>

                                    ))}
                                </ul>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end p-4 border-t border-gray-300">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationsModal;