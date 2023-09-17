import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { AiOutlinePlus, AiOutlineDelete, AiOutlineClose } from 'react-icons/ai';
import { FaCloudUploadAlt } from 'react-icons/fa';
import axios from 'axios';

const FileDetails = ({ fileName, onDelete }) => {
  const deleteFile = () => {
    onDelete(fileName)
  }
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


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const getFromAxios = () => {
    axios.get('http://localhost:5000')
    .then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const postToPython = () => {
    const formData = new FormData();
  
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
  
    axios.post('http://localhost:5000/greeting', formData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log("error", err);
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
              <FileDetails key={file.name} fileName={file.name} onDelete={() => handleDeleteFile(file.name)} />
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
