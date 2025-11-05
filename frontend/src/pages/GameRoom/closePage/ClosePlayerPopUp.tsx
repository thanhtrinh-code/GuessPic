import { ToastContainer } from 'react-toastify'
export default function ClosePlayerPopUp() {
  return (
    <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        theme="light"
      />
  )
}
