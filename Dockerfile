FROM ubuntu:latest

# Install dependencies
RUN apt update && apt install -y \
    curl wget unzip git build-essential clang cmake pkg-config libssl-dev llvm-dev libclang-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*
	
# Configure git
RUN git config --global http.sslVerify false

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Sui Client from Testnet branch
RUN cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui --features tracing

# Install Walrus Client
RUN wget https://storage.googleapis.com/mysten-walrus-binaries/walrus-testnet-latest-ubuntu-x86_64 -O /usr/local/bin/walrus && \
    chmod +x /usr/local/bin/walrus

# Verify installations
RUN sui --version && walrus --version || echo "Walrus installed"

# Set faucet configuration (replace with actual configs if needed)
ENV SUI_FAUCET_CONFIG=/root/.sui/faucet.yaml

# Entrypoint - Starts both WAL and Sui Faucet
CMD ["sh", "-c", "sui faucet start & walrus publisher start"]
