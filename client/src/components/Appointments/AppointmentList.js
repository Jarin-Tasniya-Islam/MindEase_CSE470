import React from 'react';

const AppointmentList = () => {
    const appointments = [
        { id: 1, name: 'John Doe', type: 'Peer Listener', date: '2025-08-20' },
        { id: 2, name: 'Jane Smith', type: 'Counselor', date: '2025-08-21' },
    ];

    return (
        <div>
            <h1>Appointment List</h1>
            <ul>
                {appointments.map((appointment) => (
                    <li key={appointment.id}>
                        {appointment.name} - {appointment.type} on {appointment.date}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AppointmentList;
