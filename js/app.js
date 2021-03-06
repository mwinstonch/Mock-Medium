// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.error('registration failed')
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import _ from 'underscore'
import $ from  'jquery'
import FireBase from 'firebase'
import BackboneFire from 'bbfire'




// console.log($)
// console.log(_)
// console.log(BackboneFire)
// console.log(FireBase)

function app() {
    // start app
    // new Router()
    var AuthView = React.createClass({

    	_handleSignUp: function(evt){
		    var component = this
		    var evt = evt
		    console.log("event!", evt)
		    evt.preventDefault()

		    var emailInput    = evt.currentTarget.email.value
		    var pwInput       = evt.currentTarget.password.value
		    var userNameInput = evt.currentTarget.username.value


		    fbRef.createUser(
		      {
		        email    : emailInput,  // internal to fb
		        password : pwInput //internal to fb
		      }, 

		    function(err, authData){
		       console.log(err)
		       console.log(authData)
		       var userBlogsColl = new UserBlogsColl(fbRef);

		        userBlogsColl.create({
		           username: userNameInput,
		           id: authData.uid,
		           posts: ''
		        })

		         //notify app of authenticatedUser
		        myRouter.authenticatedUser = authData.uid
		        myRouter.authenticatedUserPosts = new PostsByUserColl(fbRef, authData.uid)

		        myRouter.navigate('', {trigger: true} )

		    })
		},

		componentDidMount: function(){
		    var component = this
		    this.props.coll.on('sync', function(){
		        console.log("mounted", component.props.coll)
		      	component.setState({
		        	userSecretColl: component.props.coll
		    	})
		    })
		},

    	render: function(){
		    return (
		      <div>
		        <form onSubmit={this._handleSignUp}>
		          <h3>Welcome to Another Blog Site!</h3>
		          <input type="text" id="email" placeholder="Email"/><br/>
		          <input type="password" id="password" placeholder="Password"/><br/><br/>

		          <input type="text" id="username" placeholder="Your Name"/><br/>
		          <input id="signup" type="submit" defaultValue="Sign Up"/><br/>

		        </form>
		        <hr/>
		        <form onSubmit={this._handleLogIn}>
		          <h3 className="signin">Sign In</h3>
		          <input type="text" id="email" placeholder="Email"/><br/>
		          <input className="button-primary" type="submit" defaultValue="Log In"/><br/>
		        </form>
		      </div>
		    )
  		}
    })

    var HomeView = React.createClass({
    	getInitialState: function(){	
    		return {
    			posts: this.props.postsColl
    		}
    	},

    	// componentDidMount: function(){
    	// 	var self = this
    	// 	this.props.postsColl.on('sync', function(){

    	// 	})
    	// },

    	_addPost: function(e) {
    		console.log("new post")

    		this.props.postsColl.add({
    			content: e.currentTarget.value
    		})
    	},

    	render: function() {

    		console.log('home')
    		var coll = this.props //.get('id')
    		console.log(coll)
    		return (
    			<div id="homeDiv">
    				<div>Your posts go here</div>
    				<input onKeyPress={this._addPost}type="text"></input>
    			</div>
    		)
    	}
    })

    var UserBlogsColl = BackboneFire.Firebase.Collection.extend({
  		url: "",
  		initialize: function(fb){
    		this.url = fb.child('users')
  		}
	})

	var PostsByUserColl = BackboneFire.Firebase.Collection.extend({
		url: "",
		initialize: function(fb, usrUid){
  		this.url = fb.child('users').child(usrUid).child('posts')
  		console.log(this.url)
  	}
	})



    var AppRouter = BackboneFire.Router.extend({
    	routes: {
    		"authenticate": "showSplash",
    		"*home": "showHome"
    	},

    	showHome: function() {
    		if (this.authenticatedUser === null) {
    			this.navigate('authenticate', {'trigger': true})
    			return
    		}
 			

    		DOM.render(<HomeView postsColl={this.authenticatedUserPosts}/>, document.querySelector('.container'))
    	},

    	showSplash: function() {
    		console.log("work please")
    		
    		var fbColl = new UserBlogsColl(fbRef)
    		console.log(fbColl)
    		 DOM.render(<AuthView coll={fbColl}/>, document.querySelector('.container'))
    	},

    	initialize: function() {
    		var rtr = this
    		fbRef.onAuth(function(authData){
      			if(authData){
		        	console.log('authenticated')
		        	rtr.authenticatedUser = authData.uid

		      	} else {
		        	console.log('Not authenticated')
		        	rtr.authenticatedUser = null
		        }
      		})
    		console.log("routing")
    		BackboneFire.history.start()
    	}
    })
    var fbRef = new Firebase("https://anotherblog.firebaseio.com/")
    var myRouter = new AppRouter()
}

app()
