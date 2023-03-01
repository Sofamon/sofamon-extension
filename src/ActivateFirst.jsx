const ActivateFirst = () => {
  return (
    <div
      style={{
        height: 314,
        width: 210,
        backgroundColor: "white",
        userSelect: "none",
      }}
    >
      <center
        style={{
          paddingTop: 10,
          fontFamily: "Cantarell, Arial, sans-serif",
        }}
      >
        sofamon.xyz
      </center>
      <center>
        <img
          style={{
            width: 128,
            height: 128,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
            marginBottom: 54,
          }}
          src="images/icon128.png"
        />
      </center>
      <a
        href="http://localhost:3000/inventory"
        target="_blank"
        style={{
          textDecoration: "none",
          textAlign: "center",
          color: "black",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        <div>Activate A Character First</div>
      </a>
    </div>
  );
};

export default ActivateFirst;
