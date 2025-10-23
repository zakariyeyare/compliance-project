import CustomCard from './components/ui/CustomCard.jsx';


function WebApp() {

  return (
    <>
      <h1>Welcome to the Compliance Web App</h1>
      <CustomCard 
      title="Click Me" 
      onClick={() => alert("Button")} 
    />
    </>
  )
}

export default WebApp
