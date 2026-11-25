import { Routes , Route , Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import NoteMenu from "./pages/NoteMenu";
import Summary from "./pages/Summary";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
  return(
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>

      {/* login required */}
      <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
      <Route path="/notes/:id" element={<ProtectedRoute><NoteMenu/></ProtectedRoute>} />
      <Route path="/notes/:id/summary" element={<ProtectedRoute><Summary/></ProtectedRoute>} />
      <Route path="/notes/:id/quiz" element={<ProtectedRoute><Quiz/></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;