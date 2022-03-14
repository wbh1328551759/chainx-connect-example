const { Keyring } = require('@polkadot/keyring');
const { mnemonicGenerate, cryptoWaitReady, signatureVerify } = require('@polkadot/util-crypto');
const { stringToU8a, u8aToHex } = require('@polkadot/util');


const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });

// Gets a random string of mnemonic words
const mnemonic = mnemonicGenerate();

(async () => {
  await cryptoWaitReady();

  //create & add the pair to the keyring with the type and some additional
  const pair = keyring.addFromUri(mnemonic, { name: 'test' }, 'sr25519');

  //address: xxx
  console.log('address: ', pair.address)
  // name: test
  console.log('name: ', pair.meta.name)

  //adjust the default ss58Format for Chainx mainnet
  keyring.setSS58Format(44);
  console.log('chainx mainnet: ', pair.address)

  //adjust the default ss58Format for Chainx mainnet
  keyring.setSS58Format(42);
  console.log('chainx testnet: ', pair.address)

  //get publicKey, Uint8Array
  console.log(pair.publicKey);

  //get publicKey by decode address, Uint8Array
  console.log(keyring.decodeAddress(pair.address));

  //get publicKey by encode address
  console.log(keyring.encodeAddress(pair.publicKey, 44));
  console.log(keyring.encodeAddress(pair.publicKey, 42));

  // create the message, actual signature and verify
  const message = stringToU8a('this is our message');
  const signature = pair.sign(message);
  const isValid1 = pair.verify(message, signature, pair.publicKey);
  // output the result
  console.log(`${u8aToHex(signature)} is ${isValid1 ? 'valid' : 'invalid'}`);

  //verify the message using pair's address
  const { isValid } = signatureVerify(message, signature, pair.address);
  // output the result
  console.log(`${u8aToHex(signature)} is ${isValid ? 'valid' : 'invalid'}`);

})()


