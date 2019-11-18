const express = require("express");

const app = express();
app.listen(3000, () => console.log("listening on Port 3000"));
app.use(express.static("public"));  
app.use("/snap", express.static(__dirname + "/node_modules/snapsvg/dist"));  

// configure pug
app.set('views', './templates')
app.set('view engine', 'pug')

// routing
app.get('/', (req, res) =>  {
        res.render('index');
    }
);