package authmodule

import (
	"errors"

	"github.com/google/uuid"
)

type inMemoryUUIDAuth[T any] struct {
	tokens map[string]T
}

func NewInMemoryUUIDAuth[T any]() Auth[T] {
	tokens := make(map[string]T)
	return &inMemoryUUIDAuth[T]{tokens: tokens}
}

func (m *inMemoryUUIDAuth[T]) GetToken(payload T) (string, error) {
	tokenStr := uuid.New().String()
	m.tokens[tokenStr] = payload
	return tokenStr, nil
}

func (m *inMemoryUUIDAuth[T]) Validate(tokenStr string) (T, error) {
	payload, ok := m.tokens[tokenStr]
	if !ok {
		return payload, errors.New("invalid token")
	}

	return payload, nil
}
