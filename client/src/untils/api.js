import axios from "axios";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const uploadFile = (url, fileField, file) => {
  const formData = new FormData();
  formData.append(fileField, file);
  return axios.post(url, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data"
    }
  });
};