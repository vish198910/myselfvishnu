import express, { response } from "express";
import bodyParser from "body-parser";
import {MongoClient} from "mongodb";
import path from "path";
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"/build")));

const withDB =async(operations)=>{
    try{
        const client = await MongoClient.connect("mongodb://localhost:27017",{useNewUrlParser:true,useUnifiedTopology:true});
        const db = client.db("myselfvishnu");

        await operations(db);

        client.close();
        }
     catch(err){
            res.status(500).json({message:"Error connecting to db",err});
        }
}
app.get("/api/articles/:name", async(req,res)=>{
    withDB(async(db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection("articles").findOne({name:articleName}) ;
        res.status(200).send(articleInfo);
    })
    

});

app.get("/hello",(request,response)=>{
    return response.send("Hello");
});
app.get("/hello/:name",(req,res)=>{
    return res.send(`Hello ${req.params.name}`);
})
app.post("/hello",(req,res)=>{
    return res.send(`Post Hello  ${req.body.name}`);
})

app.post("/api/articles/:name/upvote",async(req,res)=>{

    withDB(async(db)=>{
        const articleName = req.params.name;

        const articleInfo = await db.collection("articles").findOne({name:articleName});
    
        await db.collection("articles").updateOne({name:articleName},{"$set":{
            upvotes:articleInfo.upvotes + 1,
        }});
        const updatedArticleInfo = await db.collection("articles").findOne({name:articleName});
        res.status(200).json(updatedArticleInfo);
    });
    
});

app.post("/api/articles/:name/comment",async(req,res)=>{

    withDB(async(db)=>{
        const articleName = req.params.name;
        const {name,text} = req.body;

        const articleInfo = await db.collection("articles").findOne({name:articleName});
        await db.collection("articles").updateOne({name:articleName},{"$set":{
            comments:articleInfo.comments.concat({name,text}),
        }});

        const updatedArticleInfo = await db.collection("articles").findOne({name:articleName});
        res.status(200).json(updatedArticleInfo);
    })
        
});
app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname+"/build/index.html"));
})
app.listen(8000,()=> console.log("Listening on port 8000"),);