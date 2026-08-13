FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    vim \
    nano \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Create a non-root user for the workspace
RUN useradd -m -s /bin/bash cloudlab \
    && echo "cloudlab ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER cloudlab
WORKDIR /workspace

CMD ["/bin/bash"]
