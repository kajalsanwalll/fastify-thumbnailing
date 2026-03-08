Fastify Backend Project
--
A backend project built using Fastify to explore high-performance API development, authentication, and image handling.   

The application allows users to upload, manage, and download their own thumbnails, with images stored using Cloudinary and deployed on Vercel. 

Features
--
High-performance Fastify server.  
JWT-based authentication.  
Upload and manage thumbnails.  
Cloud image storage.   
RESTful API structure.   
Modular backend architecture.   

Tech Stack
--
Runtime: Node.js.  
Framework: Fastify.  
Database: MongoDB.   
Image Storage: Cloudinary.   
Deployment: Vercel.   
Language: JavaScript.  

Project Structure
--
project-root.  
├── controllers.  
├── models.   
├── plugins.   
├── routes.  
├── public.  
├── api.   
├── server.js.   
└── vercel.json.  

Getting Started
--
Clone the repository.  
git clone repo's url.   
cd repo-name.  
Install dependencies using:  
npm install.      
Run the server.   
npm run dev.   
Server runs on:
http://localhost:3000.   
* Environment Variables: 
Create a .env file:
MONGODB_URI=your_mongodb_uri
JWT_TOKEN=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Author
--
Kajal Sanwal :)

Exploring backend systems, high-performance APIs, and scalable web architecture.