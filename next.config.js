/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  }
  // webpack: (config, { webpack }) => {
  // config.plugins.push(
  //   new webpack.IgnorePlugin({
  //     resourceRegExp: /^pg-native$|^cloudflare:sockets$/
  //   })
  // )

  //   return config
  // }
}
