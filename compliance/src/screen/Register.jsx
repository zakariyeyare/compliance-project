import React, { useState } from 'react';
import Supabase from '../SupabaseClient';

function Register() {
  // useState hooks - disse "husker" hvad brugeren skriver i input felterne
  const [navn, setNavn] = useState('');         // Husker navn - starter med tom tekst
  const [email, setEmail] = useState('');       // Husker email - starter med tom tekst  
  const [password, setPassword] = useState(''); // Husker password - starter med tom tekst
  
  // handleSubmit funktion - sender data til Supabase når brugeren klikker "Opret bruger"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stopper siden i at refreshe

    console.log("Sender til supabase:", navn, email, password);

    // Send data til Supabase database
    const { data, error} = await Supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: navn
        }
      }
    });
    
    if (error){
      console.log("Fejl:", error.message);
    } else {
      console.log("Success! Bruger oprettet:", data.user);
    }
  };

  return (
    <div> 
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {/* Input felter - her skriver brugeren deres oplysninger */}
        <input 
          type="text" 
          placeholder="Navn"
          value={navn}                           // Viser hvad der er gemt i 'navn' variablen
          onChange={(e) => setNavn(e.target.value)} // Opdaterer 'navn' når brugeren skriver
        />
        
        <input 
          type="email" 
          placeholder="Email"
          value={email}                          // Viser hvad der er gemt i 'email' variablen
          onChange={(e) => setEmail(e.target.value)} // Opdaterer 'email' når brugeren skriver
        />
        
        <input 
          type="password" 
          placeholder="Adgangskode"
          value={password}                       // Viser hvad der er gemt i 'password' variablen
          onChange={(e) => setPassword(e.target.value)} // Opdaterer 'password' når brugeren skriver
        />
        
        {/* Submit knap - sender formularen når brugeren klikker */}
        <button type="submit">Opret bruger</button>
      </form>
    </div>
  );
}

export default Register;