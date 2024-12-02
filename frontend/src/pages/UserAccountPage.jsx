import { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function UserAccountPage() {
  const [user, setUser ] = useState(null);
  // const [selectedImage, setSelectedImage] = useState(user?.image || ""); // Store uploaded image
  const [previewImage, setPreviewImage] = useState(""); // Preview image before upload

  // if (!user) {
  //   return <Navigate to={"/login"} />;
  // }


  useEffect(() => {
    axios.get('/profile').then(({data}) =>{
      setUser(data);
      setPreviewImage(data?.image)
    })
  },[]);


  console.log("user", user)

  //image upload related
  //useEffect below no longer displays the information on the profile page

  // useEffect(() => {
  //   // Fetch updated user data on page load
  //   axios
  //     .get("/api/profile", { params: { email: user.email } })
  //     .then((response) => {
  //       setUserData(response.data); // Update the user data with the latest info
  //       setPreviewImage(response.data.image || ""); // Set the image URL
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching user data:", error);
  //     });
  // }, [user.email]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file)); // Preview the uploaded file
      const formData = new FormData();
      formData.append("image", file);
      formData.append("email", user.email); // Identify user by email

      // Upload the file to the server
      axios
        .post("/api/upload-profile-photo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          setPreviewImage(response.data.imageUrl); // Update image URL
          setUser(prev => ({...prev, image: response.data.imageUrl}))
          alert("Profile photo updated successfully!");
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          alert("Failed to upload profile photo.");
        });
    }
  };

  if (!user) {
    return <></>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px" }}>
      <h1>User Profile</h1>
      <img src="../src/assets/logo.png" alt="" className="w-31 h-30"/>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%", marginTop: "20px" }}>
        {/* Left Section */}
        <div style={{ flex: 1, marginRight: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label>User Name</label>
            <input
              type="text"
              value={user.name || ""}
              readOnly
              style={{
                display: "block",
                width: "250px",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Email</label>
            <input
              type="email"
              value={user.email || ""}
              readOnly
              style={{
                display: "block",
                width: "250px",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>

        {/* Right Section: Profile Photo */}
        <div style={{ flex: 0.5, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#ccc",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              marginBottom: "10px",
            }}
          >
            <img
              src={`http://localhost:4000${previewImage}` || "default-profile.png"} // Show preview image or default
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <label
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            Change
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }} // Hide the file input
            />
          </label>
        </div>
      </div>
    </div>
  );
}





// // import React from 'react'
// import { useContext } from "react";
// import { UserContext } from "../UserContext";
// import { Navigate } from "react-router-dom";

// export default function UserAccountPage() {
//   const { user } = useContext(UserContext);

//   if (!user) {
//     return <Navigate to={'/login'} />;
//   }

//   return (
//     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px" }}>
//       <h1>User Profile</h1>
//       <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%", marginTop: "20px" }}>
        
//         {/* Left Section: Profile Details */}
//         <div style={{ flex: 1, marginRight: "20px" }}>
//           <div style={{
//             width: "100px",
//             height: "100px",
//             borderRadius: "50%",
//             backgroundColor: "#ccc",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             marginBottom: "10px",
//           }}>
//             <span style={{ fontSize: "24px", color: "#fff" }}>👤</span>
//           </div>
//           <button
//             style={{
//               padding: "10px 20px",
//               backgroundColor: "#007bff",
//               color: "#fff",
//               border: "none",
//               borderRadius: "5px",
//               cursor: "pointer",
//             }}
//             onClick={() => alert("Change Profile Photo clicked!")}
//           >
//             Change
//           </button>

//           <div style={{ marginBottom: "10px" }}>
//             <label>User Name</label>
//             <input
//               type="text"
//               value={user.name || ""}
//               readOnly
//               style={{
//                 display: "block",
//                 width: "250px",
//                 padding: "10px",
//                 marginTop: "5px",
//                 borderRadius: "5px",
//                 border: "1px solid #ccc",
//               }}
//             />
//           </div>
          
//           <div style={{ marginBottom: "10px" }}>
//             <label>Email</label>
//             <input
//               type="email"
//               value={user.email || ""}
//               readOnly
//               style={{
//                 display: "block",
//                 width: "250px",
//                 padding: "10px",
//                 marginTop: "5px",
//                 borderRadius: "5px",
//                 border: "1px solid #ccc",
//               }}
//             />
//           </div>

          
//         </div>

//         {/* Right Section: Profile Photo */}
//         <div style={{ flex: 0.5, display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          
//         </div>
//       </div>
//     </div>
//   );
// }
