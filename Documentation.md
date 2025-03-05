# Ruidoperla NFT Project Documentation

## Overview

This project is a Gatsby-based web application for generating and uploading NFTs using the Perlin noise algorithm. It leverages the Lighthouse SDK for IPFS storage and requires wallet authentication for uploading content.

## Project Structure

The project follows a standard Gatsby directory structure:

 ├── node_modules # npm packages ├── src # Source code │ ├── components # React components │ ├── pages # Gatsby pages │ ├── styles # CSS styles │ └── utils # Utility functions ├── .gitignore # Specifies intentionally untracked files that Git should ignore ├── gatsby-browser.js # Gatsby browser APIs ├── gatsby-config.js # Gatsby configuration ├── gatsby-node.js # Gatsby node APIs ├── gatsby-ssr.js # Gatsby server-side rendering APIs ├── LICENSE # License information ├── package.json # Project metadata and dependencies └── README.md # Project documentation


## Key Components

### 1. `UploadImageIpfs.js`

-   **Functionality**: Captures a screenshot of a specified container using `html2canvas`, and uploads it to IPFS using the Lighthouse SDK.
-   **Dependencies**:
    -   `react`
    -   `html2canvas`
    -   `lighthouse.js`
    -   `useWallet` (from custom hook or library)
-   **Key Features**:
    -   Wallet authentication using `beaconWallet`.
    -   Conversion of public key to Base58 format if needed.
    -   Error handling for failed uploads or missing wallet connections.
-   **Usage**:
    -   The component takes a `containerRef` prop, which should be a React ref attached to the HTML element you want to capture.
    -   It displays a "Capture & Upload" button that triggers the capture and upload process.
    -   It displays a link to view the uploaded image on IPFS after successful upload.

### 2. `Html2CanvasUploader.js`

-   **Functionality**: Captures content from an HTML element using `html2canvas`, uploads the image and metadata to IPFS via Lighthouse.
-   **Dependencies**:
    -   `react`
    -   `html2canvas`
    -   `lighthouse.js`
    -   `useWallet` (from custom hook or library)
-   **Key Features**:
    -   NFT name and description can be edited via a form.
    -   Generates NFT metadata including a random "entropie" value.
    -   Displays links to view both the image and metadata on IPFS.
    -   Wallet connection check before allowing upload.
-   **States**:
    -   `name`: NFT name.
    -   `description`: NFT description.
    -   `uploading`: Boolean to indicate upload status.
    -   `ipfsUrl`: URL of the uploaded image on IPFS.
    -   `metadataUrl`: URL of the uploaded metadata on IPFS.

## Environment Variables

-   `GATSBY_LIGHTHOUSE_API_KEY`: API key for Lighthouse. Required for authentication and upload.

## Dependencies

-   **Gatsby**: React-based framework for building static sites.
-   **React**: JavaScript library for building user interfaces.
-   **html2canvas**: JavaScript library to take screenshots of webpages.
-   **lighthouse.js**: SDK for interacting with the Lighthouse IPFS storage platform.
-   **useWallet**: Custom hook or library for handling wallet connections (e.g., Temple Wallet).
-   **dotenv**: For loading environment variables from a `.env` file.
-   **Bootstrap**: CSS framework for styling.

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    -   Create a `.env` file in the root directory.
    -   Add your Lighthouse API key:

        ```
        GATSBY_LIGHTHOUSE_API_KEY=YOUR_LIGHTHOUSE_API_KEY
        ```

4.  **Start the development server:**

    ```bash
    gatsby develop
    ```

    This will start the Gatsby development server, and you can view the site in your browser at `http://localhost:8000`.

## Usage

1.  **Connect your wallet:**
    -   Use the wallet connection functionality provided by the `useWallet` hook or library.
2.  **Navigate to the component:**
    -   Access the page or component where the `UploadImageIpfs` or `Html2CanvasUploader` component is implemented.
3.  **Capture and upload:**
    -   Click the "Capture & Upload" button to capture the content and upload it to IPFS.
4.  **View on IPFS:**
    -   After successful upload, a link to view the image/metadata on IPFS will be displayed.

## Additional Notes

-   Ensure that the Lighthouse API key is properly configured in the `.env` file.
-   The `useWallet` hook should handle the wallet connection and provide the necessary wallet information.
-   Error handling is implemented to catch and log any errors that occur during the upload process.
-   The `html2canvas` library is used to capture the content of the specified HTML element as an image.
-   The uploaded images are stored on IPFS using the Lighthouse SDK.
-   Consider adding more robust error handling and user feedback mechanisms for production use.
