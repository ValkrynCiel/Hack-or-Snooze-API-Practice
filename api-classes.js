const BASE_URL = "https://hack-or-snooze-v2.herokuapp.com";

/**
 * This class maintains the list of individual Story instances
 *  It also has some methods for fetching, adding, and removing stories
 */
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }
  /**
   * This method is designed to be called to generate a new StoryList.
   *  It calls the API, builds an array of Story instances, makes a single StoryList
   * instance out of that, and then returns the StoryList instance
   */
  static async getStories() {
    // query the /stories endpoint (no auth required)
    const response = await $.getJSON(`${BASE_URL}/stories`);
    // turn the plain old story objects from the API into instances of the Story class
    const stories = response.stories.map(story => new Story(story));
    // build an instance of our own class using the new array of stories
    const storyList = new StoryList(stories)
    return storyList;
  }
  /**
     * Method to make a POST request to /stories and add the new story to the list
     The function should accept the current instance of User who will post the story
     It should also accept an object which with a title, author, and url
     */
  
  async addStory(user, newStory) {
    // this function should return the newly created story so it can be used in the script.js file where it will be appended to the DOM
    let token = user.loginToken;
    let story = newStory;
    let sendLocation = 'https://hack-or-snooze-v2.herokuapp.com/stories';

    let response = await $.post(sendLocation, {token, story});
   
    return response.story;
     
  }
}


/**
 * The User class to primarily represent the current user.
 *  There are helper methods to signup (create), login, and stayLoggedIn
 */
class User {
  constructor(userObj) {
    this.username = userObj.username;
    this.name = userObj.name;
    this.createdAt = userObj.createdAt;
    this.updatedAt = userObj.updatedAt;

    // these are all set to defaults, not passed in by the constructor
    this.loginToken = "";
    this.favorites = [];
    this.ownStories = [];
    }
    
    

  /*
   A class method to create a new user - it accepts a username, password and name
   It makes a POST request to the API and returns the newly created User as well as a token
   */
  static async create(username, password, name) {
    const response = await $.post(`${BASE_URL}/signup`, {
      user: {
        username,
        password,
        name
      }
    });
    // build a new User instance from the API response
    const newUser = new User(response.user);

    // attach the token to the newUser instance for convenience
    newUser.loginToken = response.token;

    // save the token to localStorage
    localStorage.setItem("token", response.token);

    // also save the username so that we don't have to decode the token to get it every time
    localStorage.setItem("username", newUser.username); 
    return newUser;
  }

  async toggleFavoriteStories(evt) {
    let $specificStoryClone = ($(evt.target).closest('li').clone()).prop('outerHTML');
    let storyId = $(evt.target).closest('li').attr('id');
    let favoritesLink = `https://hack-or-snooze-v2.herokuapp.com/users/${username}/favorites/${storyId}`;
    let token = user.loginToken;
    // First logic: send post request for favoriting article:
    if ($(evt.target).hasClass('far')) {
      await $.post(favoritesLink, {token});
      $('#favorited-articles').prepend($specificStoryClone);
      let listOfUnstarred = $('#favorited-articles').find('i.far')
      for (let star of listOfUnstarred){
        star.classList.remove('far')
        star.classList.add('fas')
      }
    // Second logic: send delete request for un-favoriting article. NOTE FOR GAB: $.ajax is for when get and post aren't enough and you need to customize. it accepts only 1 object, with minimum the url and request type, and then a third optional key of data that has an object as its value. 
    } else {
      await $.ajax({url: favoritesLink, type: 'DELETE', data: {token}});
    }
    $(evt.target).toggleClass('far fas');
  }
  /*
   A class method to log in a user. It returns the user 
   */
  static async login(username, password) {
    const response = await $.post(`${BASE_URL}/login`, {
      user: {
        username,
        password
      }
    });
    // build a new User instance from the API response
    const existingUser = new User(response.user);

    // instantiate Story instances for the user's favorites and ownStories
    existingUser.favorites = response.user.favorites.map(story => new Story(story))
    existingUser.ownStories = response.user.stories.map(story => new Story(story));

    // attach the token to the newUser instance for convenience
    existingUser.loginToken = response.token;

    // save the token to localStorage
    localStorage.setItem("token", response.token);

    // also save the username so that we don't have to decode the token to get it every time
    localStorage.setItem("username", existingUser.username);

    return existingUser;
  }

  /**
   * This function grabs a token and username from localStorage.
   *  It uses the token & username to make an API request to get details
   *   about the user. Then it creates an instance of user with that inf function.
   */
  static async stayLoggedIn() {
    // get username and token from localStorage
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // call the API
    const response = await $.getJSON(`${BASE_URL}/users/${username}`, {
      token
    });
    // instantiate the user from the API information
    const existingUser = new User(response.user);

    // attach the token to the newUser instance for convenience
    existingUser.loginToken = token;

    // instantiate Story instances for the user's favorites and ownStories
    existingUser.favorites = response.user.favorites.map(
      story => new Story(story)
    );
    existingUser.ownStories = response.user.stories.map(
      story => new Story(story)
    );
    return existingUser;
  }
}
/**
 * Class to represent a single story. Has one method to update.
 */
class Story {
  /*
   * The constructor is designed to take an object for better readability / flexibility
   */
  constructor(storyObj) {
    this.author = storyObj.author;
    this.title = storyObj.title;
    this.url = storyObj.url;
    this.username = storyObj.username;
    this.storyId = storyObj.storyId;
    this.createdAt = storyObj.createdAt;
    this.updatedAt = storyObj.updatedAt;
  }
}

