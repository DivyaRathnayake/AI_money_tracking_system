import React, { useState, useEffect } from 'react';
import axios from "axios";
import profile from "../assets/profile.jpg";

export default function AccountSettings() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(profile);
  const token = localStorage.getItem("token"); // JWT from login

  // Fetch user info on mount
  useEffect(() => {
    if (!token) return;
    axios.get("http://localhost:5000/user", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setFormData(res.data);
      if(res.data.profileImage) setPreview(res.data.profileImage); // if user already has profile image
    })
    .catch(err => console.log(err));
  }, [token]);

  // Update preview when file is selected
  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl); // clean up
  }, [selectedFile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("email", formData.email);
    if(selectedFile) data.append("profileImage", selectedFile);

    axios.put("http://localhost:5000/user", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    })
    .then(res => alert(res.data.message))
    .catch(err => console.log(err));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-200 to-white">
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-md shadow-md border">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">ACCOUNT SETTINGS</h2>

        <div className="flex justify-center mb-6">
          <img src={preview} alt="User Avatar" className="w-24 h-24 rounded-full border" />
        </div>

        <div className="flex justify-center mb-6">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="text-center mt-6">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold shadow"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
