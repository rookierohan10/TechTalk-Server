//Imports
import express from 'express';
import {configDotenv} from "dotenv";
import {createClient} from '@supabase/supabase-js';
import cors from 'cors';

//Create Express App
const app = express();
const port = 5000;

//Configuration
app.use(cors());
app.use(express.json());
configDotenv();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

//Supabase Client
const supabase = createClient(process.env.SUPA_URL, process.env.SUPR_KEY);

//Request Handlers

//Default URL
app.get("/", (req, res) => {
    res.send(`<h1>DevEcho Server</h1>`);
});

//Sign-up
app.post("/sign-up", async (req, res) => {
    let {name, email, password} = req.body;

    const {data} = await supabase
        .from('user')
        .select()
        .eq("email", email);
    if (data.length !== 0) {
        console.log(data);
        res.send("exists");
    } else {
        const {error} = await supabase
            .from('user')
            .insert({name: name, email: email, password: password});
        if (error) {
            console.log(error);
            res.send("fail");
        } else res.send("success");
    }
});

//Log-in
app.post("/log-in", async (req, res) => {
    let {email, password} = req.body;

    const {data} = await supabase
        .from("user")
        .select()
        .eq("email", email);

    if (data.length!==0) {
        if (data[0].password === password) {
            res.send("success");
        } else {
            res.send("wrong-pass");
        }
    } else {
        res.send("no-acc");
    }
});

//Create Post
app.post("/create-post", async (req, res) => {
    let {title, content, tags, category, user_id} = req.body;

    const {error} = await supabase
        .from("posts")
        .insert({title: title, content: content, tags: tags, category: category, user_id: user_id});

    if (error) res.send("error");
    else res.send("success");
});

//Fetch Posts
app.get("/fetch-posts", async (req, res) => {
    const {data, error} = await supabase
        .from("posts")
        .select();

    if (error) res.send("error");
    if (data.length !== 0) res.send(data);
    else res.send("no_data");
});

//Fetch Posts by ID
app.post("/fetch-user-posts", async (req, res) => {
    let {user_id} = req.body;

    const {data, error} = await supabase

        .from("posts")
        .select()
        .eq("user_id", user_id);

    if (error) res.send("error");
    if (data.length !== 0) res.send(data);
    else res.send("no_data");
});

//Fetch User Details
app.post("/fetch-user", async (req, res) => {
    let {em} = req.body;

    const {data, error} = await supabase
        .from("user")
        .select()
        .eq("email", em);

    if (data[0]) {
        res.send({id: data[0].id, name: data[0].name, email: data[0].email});
    } else {
        res.send("no-acc");
    }
});

//Get Post Details
app.post("/get-post-details", async (req, res) => {
    let {id} = req.body;

    const {data} = await supabase
        .from("posts")
        .select()
        .eq("id", id);

    if (data.length !== 0) {
        res.send(data);
    } else {
        res.send("no-data");
    }
});

//Update Post
app.post("/edit-post", async (req, res) => {
    let {id, title, content, tags, category} = req.body;

    const {error} = await supabase
        .from("posts")
        .update({title: title, content: content, tags: tags, category: category})
        .eq("id", id);

    if (error) res.send("error");
    else res.send("success");
});

//Delete Post
app.post("/del-post", async (req, res) => {
    let {id} = req.body;

    const {error} = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

    if (error) res.send("error");
    else res.send("success");
});

//Get Categories
app.get("/get-categories", async (req, res) => {
    const {data} = await supabase
        .from("category")
        .select();

    res.send(data);
});

//Search
app.post("/search", async (req, res) => {
    let {search} = req.body;
    search = search.toLowerCase();
    const {data} = await supabase
        .from("posts")
        .select()
        .or(`title.ilike.%${search}%, content.ilike.%${search}%, tags.ilike.%${search}%`);

    console.log(data);
    if (data.length !== 0) {
        res.send(data);
    } else {
        res.send("no_data");
    }
});

//Server Listener
app.listen(port, () => {
    console.log("The server is listening on http://localhost:" + port);
});