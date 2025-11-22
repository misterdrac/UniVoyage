-- this migration script is used for creating junction tables for many-to-many relationships
-- User can speak multiple languages and have multiple hobbies, and multiple languages and hobbies can be associated with multiple users
-- Links users to multiple languages
CREATE TABLE user_languages (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lang_code CHAR(2) REFERENCES languages(lang_code) ON DELETE CASCADE,
    PRIMARY KEY (user_id, lang_code)
);

-- Links users to multiple hobbies
CREATE TABLE user_hobbies (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    hobby_id INTEGER REFERENCES hobbies(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, hobby_id)
);