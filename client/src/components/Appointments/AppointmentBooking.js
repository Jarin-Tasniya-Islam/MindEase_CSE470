import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentBooking = () => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        date: '',
        time: '',
    });
    const [supportPersons, setSupportPersons] = useState([]);

    useEffect(() => {
        const fetchSupportPersons = async () => {
            try {
                const response = await axios.get('/api/support-persons');
                setSupportPersons(response.data);
            } catch (error) {
                console.error('Failed to fetch support persons:', error);
            }
        };
        fetchSupportPersons();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/appointments', {
                supportPersonId: formData.type,
                date: `${formData.date}T${formData.time}:00`,
                note: `Booked by ${formData.name}`,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert(`Appointment booked successfully: ${response.data}`);
        } catch (error) {
            alert(`Failed to book appointment: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Book an Appointment</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.fieldContainer}>
                    <label style={styles.label}>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.fieldContainer}>
                    <label style={styles.label}>Support Person:</label>
                    <select name="type" value={formData.type} onChange={handleChange} required style={styles.input}>
                        <option value="">Select Support Person</option>
                        {supportPersons.map(person => (
                            <option key={person._id} value={person._id}>
                                {person.name} ({person.title})
                            </option>
                        ))}
                    </select>
                </div>
                <div style={styles.fieldContainer}>
                    <label style={styles.label}>Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.fieldContainer}>
                    <label style={styles.label}>Time:</label>
                    <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>Book Appointment</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '600px',
        margin: '40px auto',
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#f0f8ff',
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        fontFamily: 'Segoe UI, sans-serif',
    },
    heading: {
        textAlign: 'center',
        color: '#0077b6',
        marginBottom: '20px',
        fontSize: '24px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    fieldContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
        fontSize: '16px',
        color: '#555',
    },
    input: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #a3cde3',
        fontSize: '16px',
        backgroundColor: '#ffffff',
    },
    button: {
        backgroundColor: '#0077b6',
        color: 'white',
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
    },
};

export default AppointmentBooking;
