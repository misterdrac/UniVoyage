-- this migration script is used for creating junction tables for many-to-many relationships
-- User can speak multiple languages and have multiple hobbies, and multiple languages and hobbies can be associated with multiple users

-- Links users to multiple languages
-- Links users to multiple languages
CREATE TABLE user_languages (
    user_id   BIGINT NOT NULL,
    lang_code VARCHAR(2) NOT NULL,

    PRIMARY KEY (user_id, lang_code),

    CONSTRAINT fk_user_languages_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_languages_language
        FOREIGN KEY (lang_code) REFERENCES languages(lang_code) ON DELETE CASCADE
);

-- Links users to multiple hobbies
CREATE TABLE user_hobbies (
    user_id  BIGINT NOT NULL,
    hobby_id BIGINT NOT NULL,

    PRIMARY KEY (user_id, hobby_id),

    CONSTRAINT fk_user_hobbies_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_hobbies_hobby
        FOREIGN KEY (hobby_id) REFERENCES hobbies(id) ON DELETE CASCADE
);

