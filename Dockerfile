FROM ruby:3.3.11

RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libsqlite3-dev \
    libvips \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/api

COPY api/Gemfile api/Gemfile.lock ./
RUN bundle install

COPY api/ ./

RUN sed -i 's/\r$//' bin/docker-dev-entrypoint && chmod +x bin/docker-dev-entrypoint

EXPOSE 3000

ENTRYPOINT ["bin/docker-dev-entrypoint"]
CMD ["bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
