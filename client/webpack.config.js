module.exports = {
    entry: './src/main.ts', // Your TypeScript entry file
    mode: 'development',
    output: {
      filename: './dist/bundle.js', // Output bundle file
      libraryTarget: 'var',
      library: 'main'
    },
    resolve: {
      extensions: ['.ts', '.js'], // Add .ts and .js to the extensions
    },
    module: {
      rules: [
        {
          test: /\.ts$/, // Apply ts-loader to TypeScript files
          exclude: /node_modules/,
          use: 'ts-loader',
        },
      ],
    },
  };