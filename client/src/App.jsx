import { Routes , Route , Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import NoteMenu from "./pages/NoteMenu";
import Summary from "./pages/Summary";

function App(){
  return(
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/" element={<Home/>}/>
      <Route path="/notes/:id" element={<NoteMenu/>} />
      <Route path="/notes/:id/summary" element={<Summary/>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;