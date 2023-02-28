const ConnectWallet = () => {
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
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAABtQTFRF////AAAA////wsLRvUiC/2uXAgcMhYWGQ0NDv3Lf1AAAAAF0Uk5TAEDm2GYAAAW8SURBVHic7ZyLkqQqDECHcdv2/794fQACBkh4mDBFqnbr3p5ZPYcAzUt/fmbMmDFjxowZM2bMmDFjxowZM2bMmDFjxowZM2bMmDHjT4bSwc1RGupXx6AKln9QBZf/UODmIUcgMJxByD+Oge53ngJjGCi1HLE7PAVGMLjwTwVAQL7BSZ0wGENAK4yYAss8agpu5EENXOKjIxquK/VGP//2GM3A4VWfD2wwkABsMJLAR1wKsvMr5QuABtwpSN9f+QKQAbNA7vZPA1kpyN/cdP5aADBgbQSoX8qkgFEAuUiSMeBuxYjwDESlABtpgwEEPANAYAWCG9kPg3wZhALrFwhhEukUQAKXBDf3HY4BXuDMAze5Di8FeAFBaUikIC2wK3Czn1EhICQJtwGlEQhKgpsCsoCEJNTUIRlJUHUC/AbxRoATYDeoFuA2qBeQYVAjwGyQEgBHpNIMDmp1hyuwjSHgL1A7/6fgOYEoA3ifz7GRbZCml98V5fEJBgwCKH7BBkh+sUMKNL9QAwK/TAOSgMCRNY1/fAFxBlR+ca2ALCAtBXQBWQYF/KIE1hIBMass67p+iwSEGBxTlDJ+nEFfgaP0KwRug1Vf6V0Be0+7tQTMg/2PwvNQStNve0QUuhk498MPpI+ND+dsiLL0ZxxX1P/ZXcArLqzAtQF7z/EPvO3GXw98vXvZOQVBtqEzZsDhuZ1fOQJn8d/0Jz607tJc4NHewHOKXl2x/NdfVjKoPHBLbiwQ3mON1KBHAh78x2d+5QEbcVsD4Caxr2E0/3nNOH5LAfgmKIEo/6prj0fsN+NWApEyinVBD4EPyP8Nin81/arzUSP+SIKhLuj8o1yNoAcN+B16t1m3NIhXUbAPUmaJ2s2A3y0p02zNpW/6cGDRQCCxqoxdjwsHEaaQLb5lf9ysXiC1Kl44lA4qyWq/zYCoFUj0cKUCIX9iMFcvAH27uzcrmQ97/Gfxp0qpSiA6Tn8Mpov5vcFna4FU7TEK5EUtr5Nfc/hVApk9LX1z4rqox58t/iqD7J6cLj/E1lKUP49fLoDZU9RFiJ+Ube4XL46/UCDde94XvxRQSVDK40fiFwp4/RwUdu5qDOAnmBx4tZTxFwnki99K7H34tqOb50FDDb0scfz093dbDfWKxi8SQG6pXxIaebmfCXXDfqqbgP6XePyeAkfcBb4kwmnEZP4CAfT1/fqCFqDx0wWw13802jS8FSDykwVw1wf7nBS7EUAfuukqkOoxYXQrQOanCuRvkDlUkwxF6D47CVTQvyKQ4QfwM0LB9xqzwBMWfo4++vPuAukJMJ3/bQHiBD7yHoPEb3AKlPA/MiRKAMH/tgClBsXeg5Hk5xTwUaLv8RAs4AwP4u8hCfhfFkjXoGCghvlCfv4So8Cm/pZAGT+nQGAwooBjgBuSQjWIUeB7LkBcsRUngFPgPIpxLQYVJoBb4EviFyhgJrTF/OwCFH6BAjT+ZjWonQCNX6AAE39bAfyayugCwGCjkL+pACEBf0+glL+lAGFV8TFgVag9YQ4BeGwaCpTzNxSA+fexKbhm5BlU8PcVWJazagNrRp6B2oQKaP6IgJ42KFXF32xhC64nCj7woQXOKVB4oFuOwJJLgBPl/P0ELH9coAKbX6Cm4ynkpwncjGISQF+efiEB7QTwNYgvARSBRaQA4ZRxpgnw1CC6APAD1gTg65DQGoRPwUsCTQ87hQKmmgOtu1UTaHzeT/mUppAjAkz8eAFbyN0ECo/sYgzMWBMQWJoJ9DhyrAD+Z+Nu0wTKT60nDOwuk3IH+c+jiw0S0OmxgdPAzLLuD338Fgmoe/AkaWCf4rw/VD5/A4HqJ38SBsAkMdxDruVv8NrL1Ol7YJLrGdTzV+PnFAApe8xb1fK3e+to9F0DoIHZRK5dgmj7BDRNoX4JpcM7X0lpqItu759+xaHz27P7OrzzCnbwUdk29P3hfYu2gbzzf1PNO/N04EFIAAAAAElFTkSuQmCC"
          draggable={false}
          alt="Sofamon Browser Extension"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 140,
            marginRight: 20,
            marginTop: 30,
            marginBottom: 44,
          }}
        />
      </center>
      <a
        href="http://localhost:3000"
        target="_blank"
        style={{
          textDecoration: "none",
          textAlign: "center",
          color: "black",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        <div>Connect Wallet</div>
      </a>
    </div>
  );
};

export default ConnectWallet;
