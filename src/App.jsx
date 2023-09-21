import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { AiOutlinePlus, AiOutlineDelete, AiOutlineClose } from 'react-icons/ai';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FileDetails = ({ fileName, onDelete, handleDownload }) => {
  const deleteFile = () => {
    onDelete(fileName);
  };

  return (
    <div className='FileDetailsContainer'>
      <h4>{fileName}</h4>
      <div className='fileConvertOptions'>
        <h5>Convert to</h5>
        <select>
          <option>ppt</option>
          <option>docx</option>
          <option>doc</option>
        </select>
      </div>
      <button className='downloadBtn' onClick={handleDownload}>
        Download
      </button>
      <button className='delBtns' onClick={deleteFile}>
        <AiOutlineClose />
      </button>
    </div>
  );
};
function App() {
  const hiddenInput = useRef(null);
  const [isFileUploaded, setFileUploaded] = useState(false);
  const [isDragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [downloadLinks, setDownloadLinks] = useState({});

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const fetchDownloadLinks = () => {
    console.log('Fetching download links...');
    axios
      .get('http://localhost:5000/downloadLinks')
      .then((res) => {
        setDownloadLinks(res.data)
        console.log(res.data);
      })
      .catch(err => {
        console.log('Error fetching file locations',err);
      })
  };
  
  const handleDownloadFile = (index) => {
    if (downloadLinks.file_info && downloadLinks.file_info.length > index) {
      const fileInfo = downloadLinks.file_info[index];
      const filename = fileInfo.filename;
      const location = fileInfo.location;
  
      console.log("Filename:", filename);
      console.log("Location:", location);
  
      // Create a temporary anchor element
      const anchor = document.createElement('a');
      anchor.href = location; // Set the URL of the file
      anchor.download = filename; // Set the filename for download
  
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
  
      anchor.click();
      
      // Clean up
      document.body.removeChild(anchor);
    } else {
      console.log("File information not found for the specified index.");
      // Handle error, e.g., display a message to the user
    }
  };

  const postToPython = () => {
    const formData = new FormData();
  
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
  
    axios
      .post('http://localhost:5000/uploadFile', formData)
      .then((res) => {
        console.log(files);
        console.log(res);
        fetchDownloadLinks();
      })
      .catch((err) => {
        console.log('error', err);
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      console.log('Dropped file:', droppedFile);
      setFiles((prevFiles) => [...prevFiles, droppedFile]);
      setFileUploaded(true);
    }
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    hiddenInput.current.click();
  };

  const handleFileInputChange = (e) => {
    const newFile = e.target.files[0];
    if (newFile && newFile.name.endsWith('.pdf')) {
      setFileUploaded(true);
      setFiles((prevFiles) => [...prevFiles, newFile]);
    } else {
      alert('Please select a PDF file.');
    }
  };
  
  
  useEffect(() => {
    if (files.length === 0) {
      setFileUploaded(false);
    } else {
      setFileUploaded(true);
    }
  }, [files]);

  const handleDelete = () => {
    setFiles([]);
  }
  
  const handleDeleteFile = (fileNameToDelete) => {
    const updatedFiles = files.filter((file) => file.name !== fileNameToDelete);
    setFiles(updatedFiles);
  };
  
  

  return (
    <div className='body'>
      <div className='navBar'>
        <h4>FILE CONVERTER</h4>
        <ul>
          <label htmlFor='fileInput' className='addBtn label'>
            <span className='icon'><AiOutlinePlus size={20} color='#ffffff' /></span>
            <span className='text'>Add file</span>
          </label>
          <input
            type='file'
            id='fileInput'
            ref={hiddenInput}
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
            multiple
          />
          <button className='delBtn' onClick={handleDelete}>
            <AiOutlineDelete size={20} />
            <span className='text'>Delete All</span>
          </button>
        </ul>
      </div>
      <div className='mainContainer'>
        <h2>Online Document Converter</h2>
        <p>
          The PDF Converter is a versatile tool designed to effortlessly
          convert PDF files into various formats. With a user-friendly interface,
          it efficiently transforms PDFs into editable DOC, Excel spreadsheets, DOCX documents, and PowerPoint presentations (PPT).
        </p>
        {isFileUploaded ? (
          <div className='uploadedFilesContainer'>
            {files.map((file, index) => (
              <FileDetails
                key={file.name}
                fileName={file.name}
                onDelete={() => handleDeleteFile(file.name)}
                handleDownload={() => handleDownloadFile(index)}
              />
            ))}
            <button className='convertBtn' onClick={postToPython}>Convert</button>
          </div>
        ) : (
          <form
            className={`fileUploadContainer ${isDragActive ? 'dragActive' : ''}`}
            onClick={handleFileUpload}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor='fileInput'>
              <FaCloudUploadAlt size={200} color='#733aed' className='uploadIcon' />
              <h3>Click or Drag & Drop a file here</h3>
            </label>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
