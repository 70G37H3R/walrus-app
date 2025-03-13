FROM debian:bullseye

# Install dependencies
RUN apt update && apt install -y \
    curl wget unzip git build-essential clang cmake pkg-config libssl-dev llvm-dev libclang-dev ca-certificates net-tools \
    && rm -rf /var/lib/apt/lists/*

# Set LIBCLANG_PATH dynamically
RUN export LIBCLANG_PATH="$(llvm-config --libdir)" && \
    export LD_LIBRARY_PATH="$(llvm-config --libdir)"

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Sui Client from Testnet branch
RUN cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui --features tracing

# Install Walrus Client
RUN wget https://storage.googleapis.com/mysten-walrus-binaries/walrus-testnet-latest-ubuntu-x86_64 \
    -O /usr/local/bin/walrus && chmod +x /usr/local/bin/walrus

# Create necessary directories and ensure Walrus config exists
RUN mkdir -p /root/wallets /root/.walrus && \
    echo '[settings]\nsub_wallets_dir = "/root/wallets"' > /root/.walrus/config.toml

# Expose required ports
EXPOSE 9000 9001

# Copy and set permissions for the entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
