const ConnectWallet = () => {
  return (
    <div
      style={{
        height: 314,
        width: 210,
        backgroundColor: 'white',
        userSelect: 'none',
      }}
    >
      <center
        style={{
          paddingTop: 10,
          fontFamily: 'Cantarell, Arial, sans-serif',
        }}
      >
        hikari.xyz
      </center>
      <center>
        <div
          style={{
            width: 96,
            height: 96,
            background: 'black',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
            marginBottom: 54,
          }}
        >
          <h2>Hikari</h2>
        </div>
      </center>
      <a
        href='http://localhost:3000'
        target='_blank'
        style={{
          textDecoration: 'none',
          textAlign: 'center',
          color: 'black',
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        <div>Connect Wallet</div>
      </a>
    </div>
  )
}

export default ConnectWallet
