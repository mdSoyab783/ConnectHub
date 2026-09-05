import "./AboutCard.css";
const AboutCard = ({ profile }) => {
  return (
    <div className="about-card">

      
      {/* =================================
          BIO
          HEADER
      ================================= */}

      <div className="about-card-header">
        <h3>About</h3>
      </div>


      {/* =================================
          BIO
      ================================= */}

      <div className="about-bio">

        <p>
          {profile.bio || "No bio added yet."}
        </p>

      </div>


      {/* =================================
          PROFILE DETAILS
      ================================= */}

      <div className="about-details">

        <div className="about-detail-item">

          <span className="about-detail-icon">
            🏫
          </span>

          <div>
            <span className="about-detail-label">
              College
            </span>

            <p>
              {profile.college || "Not added"}
            </p>
          </div>

        </div>


        <div className="about-detail-item">

          <span className="about-detail-icon">
            📍
          </span>

          <div>
            <span className="about-detail-label">
              Location
            </span>

            <p>
              {profile.location || "Not added"}
            </p>
          </div>

        </div>

      </div>


      {/* =================================
          SKILLS
      ================================= */}

      <div className="about-skills">

        <h4>Skills</h4>

        {profile.skills?.length > 0 ? (

          <div className="skills">

            {profile.skills.map((skill) => (
              <span key={skill}>
                {skill}
              </span>
            ))}

          </div>

        ) : (

          <p className="no-skills">
            No skills added yet.
          </p>

        )}

      </div>

    </div>
  );
};

export default AboutCard;