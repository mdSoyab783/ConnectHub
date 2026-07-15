const AboutCard = ({ profile }) => {
  return (
    <div className="about-card">

      <h3>About</h3>

      <p>{profile.bio || "No bio added yet."}</p>

      <p>
        <strong>🏫 College:</strong>{" "}
        {profile.college || "Not added"}
      </p>

      <p>
        <strong>📍 Location:</strong>{" "}
        {profile.location || "Not added"}
      </p>

      <div className="skills">
        {profile.skills?.length > 0 ? (
          profile.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))
        ) : (
          <p>No skills added.</p>
        )}
      </div>

    </div>
  );
};

export default AboutCard;