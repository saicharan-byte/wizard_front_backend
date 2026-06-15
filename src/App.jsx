import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
        </Routes>
    );
}

export default App;
